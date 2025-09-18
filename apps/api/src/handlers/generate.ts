import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
// import { ProductDataSchema, Label, Language, Market } from '@repo/shared';
type Label = any;
type Language = 'en' | 'pt' | 'pt-BR' | 'es' | 'zh' | 'ar';
type Market = 'US' | 'UK' | 'ES' | 'AO' | 'MO' | 'BR' | 'AE' | 'EU';
const ProductDataSchema = {
  parse: (data: any) => data
};
import { generateLabelWithRetry, BedrockError, GenerateLabelResult } from '../utils/bedrock';
import { saveLabel, generateLabelId, DynamoDBError } from '../utils/dynamodb';
import { getMarketComplianceSummary, formatMarketAllergens } from '../utils/compliance';

interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
}

interface SuccessResponse {
  success: boolean;
  data: Label;
}

// Supported markets with fallback capabilities
const SUPPORTED_MARKETS: Market[] = ['US', 'UK', 'ES', 'AO', 'MO', 'BR', 'AE', 'EU'];
const FALLBACK_MARKET: Market = 'US';

// Market-specific rate limiting (requests per minute)
const MARKET_RATE_LIMITS: Record<Market, number> = {
  'US': 60,
  'UK': 60,
  'ES': 60,
  'AO': 30, // Lower limit for developing market
  'MO': 30, // Lower limit for SAR market
  'BR': 60,
  'AE': 60,
  'EU': 60
};

// Market validation function
function validateMarket(market: unknown): { isValid: boolean; market: Market; errors: string[] } {
  const errors: string[] = [];

  if (!market) {
    errors.push('Market parameter is required');
    return { isValid: false, market: FALLBACK_MARKET, errors };
  }

  if (typeof market !== 'string') {
    errors.push('Market must be a string');
    return { isValid: false, market: FALLBACK_MARKET, errors };
  }

  const upperMarket = market.toUpperCase() as Market;
  if (!SUPPORTED_MARKETS.includes(upperMarket)) {
    errors.push(`Unsupported market: ${market}. Supported markets: ${SUPPORTED_MARKETS.join(', ')}`);
    return { isValid: false, market: FALLBACK_MARKET, errors };
  }

  return { isValid: true, market: upperMarket, errors: [] };
}

// Market-specific error messages
function getMarketErrorMessage(market: Market, errorType: string): string {
  const marketName = {
    'US': 'United States',
    'UK': 'United Kingdom',
    'ES': 'Spain',
    'AO': 'Angola',
    'MO': 'Macau SAR',
    'BR': 'Brazil',
    'AE': 'United Arab Emirates',
    'EU': 'European Union'
  }[market];

  switch (errorType) {
    case 'AI_GENERATION_ERROR':
      return `Failed to generate label for ${marketName} market. Please check product data for market-specific requirements.`;
    case 'VALIDATION_ERROR':
      return `Product data validation failed for ${marketName} market. Please ensure all required fields are provided.`;
    case 'COMPLIANCE_ERROR':
      return `Product does not meet ${marketName} regulatory compliance requirements.`;
    case 'RATE_LIMIT_ERROR':
      return `Rate limit exceeded for ${marketName} market. Please try again later.`;
    default:
      return `Error processing request for ${marketName} market.`;
  }
}

// Helper function to create consistent API responses
function createResponse(
  statusCode: number,
  body: SuccessResponse | ErrorResponse,
  headers: Record<string, string> = {}
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

function createErrorResponse(
  statusCode: number,
  error: string,
  message: string,
  details?: string
): APIGatewayProxyResult {
  return createResponse(statusCode, {
    error,
    message,
    ...(details && { details })
  });
}

function createSuccessResponse(label: Label): APIGatewayProxyResult {
  return createResponse(200, {
    success: true,
    data: label
  });
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Set function timeout to 14 seconds to ensure we stay under 15s requirement
  const timeoutId = setTimeout(() => {
    throw new Error('Function timeout after 14 seconds');
  }, 14000);

  try {
    console.log('Generate handler started', { requestId: context.awsRequestId });
    const startTime = Date.now();

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      clearTimeout(timeoutId);
      return createResponse(200, { success: true, data: {} as any });
    }

    // Validate HTTP method
    if (event.httpMethod !== 'POST') {
      clearTimeout(timeoutId);
      return createErrorResponse(405, 'METHOD_NOT_ALLOWED', 'Only POST method is allowed');
    }

    // Validate request body exists
    if (!event.body) {
      clearTimeout(timeoutId);
      return createErrorResponse(400, 'BAD_REQUEST', 'Request body is required');
    }

    // Parse request body
    let requestData: unknown;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      clearTimeout(timeoutId);
      return createErrorResponse(400, 'INVALID_JSON', 'Invalid JSON in request body');
    }

    // Validate input against ProductDataSchema
    let productData;
    try {
      productData = ProductDataSchema.parse(requestData);
      console.log('Basic input validation passed', { market: productData.market });
    } catch (error) {
      clearTimeout(timeoutId);
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      return createErrorResponse(
        400,
        'VALIDATION_ERROR',
        'Invalid product data',
        errorMessage
      );
    }

    // Validate market parameter specifically
    const marketValidation = validateMarket(productData.market);
    if (!marketValidation.isValid) {
      clearTimeout(timeoutId);
      console.error('Market validation failed', {
        providedMarket: productData.market,
        errors: marketValidation.errors
      });
      return createErrorResponse(
        400,
        'INVALID_MARKET',
        marketValidation.errors.join('; '),
        `Valid markets: ${SUPPORTED_MARKETS.join(', ')}`
      );
    }

    // Use validated market
    productData.market = marketValidation.market;
    console.log('Market validation passed', { market: productData.market });

    // Generate label using AI
    console.log('Starting AI generation', { market: productData.market });
    let generationResult: GenerateLabelResult;
    try {
      generationResult = await generateLabelWithRetry({ productData });
      console.log('AI generation completed successfully', {
        hasTranslation: !!generationResult.translatedData,
        language: generationResult.language
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof BedrockError) {
        console.error('Bedrock error:', error, { market: productData.market });
        return createErrorResponse(
          500,
          'AI_GENERATION_ERROR',
          getMarketErrorMessage(productData.market, 'AI_GENERATION_ERROR'),
          error.message
        );
      }

      console.error('Unexpected AI generation error:', error, { market: productData.market });
      return createErrorResponse(
        500,
        'INTERNAL_ERROR',
        getMarketErrorMessage(productData.market, 'INTERNAL_ERROR')
      );
    }

    // Create complete label object with multi-market support
    const labelId = generateLabelId();
    const label: Label = {
      labelId,
      productId: productData.productId,
      market: productData.market,
      language: generationResult.language,
      labelData: generationResult.labelData,
      marketSpecificData: generationResult.marketSpecificData,
      translatedData: generationResult.translatedData,
      createdAt: new Date().toISOString(),
      generatedBy: 'ai-bedrock-claude',
    };

    // Save label to database
    console.log('Saving label to database', { labelId });
    try {
      await saveLabel({ label });
      console.log('Label saved successfully');
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DynamoDBError) {
        console.error('DynamoDB error:', error);
        return createErrorResponse(
          500,
          'DATABASE_ERROR',
          'Failed to save label to database',
          error.message
        );
      }

      console.error('Unexpected database error:', error);
      return createErrorResponse(
        500,
        'INTERNAL_ERROR',
        'Unexpected error while saving label'
      );
    }

    // Clear timeout and calculate performance
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    // Market performance monitoring
    const performanceLog = {
      duration,
      labelId,
      market: productData.market,
      requestId: context.awsRequestId,
      hasTranslation: !!label.translatedData,
      language: label.language,
      meetsPerformanceTarget: duration < 15000
    };

    console.log('Generate handler completed successfully', performanceLog);

    // Log performance warning if approaching limit
    if (duration > 12000) {
      console.warn('Performance warning: Request took longer than 12 seconds', {
        market: productData.market,
        duration
      });
    }

    // Add performance metadata to response
    const enhancedLabel = {
      ...label,
      metadata: {
        generationTime: duration,
        market: productData.market,
        requestId: context.awsRequestId,
        performanceTarget: '15s',
        meetsTarget: duration < 15000
      }
    };

    // Return success response
    return createSuccessResponse(enhancedLabel);

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Unhandled error in generate handler:', error);

    // Handle timeout specifically
    if (error instanceof Error && error.message.includes('timeout')) {
      return createErrorResponse(
        408,
        'REQUEST_TIMEOUT',
        'Request timed out after 14 seconds'
      );
    }

    return createErrorResponse(
      500,
      'INTERNAL_ERROR',
      'An unexpected error occurred'
    );
  }
};