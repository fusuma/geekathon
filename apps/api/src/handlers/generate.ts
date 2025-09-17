import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ProductDataSchema, Label, Language } from '@repo/shared';
import { generateLabelWithRetry, BedrockError, GenerateLabelResult } from '../utils/bedrock';
import { saveLabel, generateLabelId, DynamoDBError } from '../utils/dynamodb';

interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
}

interface SuccessResponse {
  success: boolean;
  data: Label;
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
      console.log('Input validated successfully', { market: productData.market });
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
        console.error('Bedrock error:', error);
        return createErrorResponse(
          500,
          'AI_GENERATION_ERROR',
          'Failed to generate label with AI service',
          error.message
        );
      }

      console.error('Unexpected AI generation error:', error);
      return createErrorResponse(
        500,
        'INTERNAL_ERROR',
        'Unexpected error during label generation'
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
    console.log('Generate handler completed successfully', {
      duration,
      labelId,
      requestId: context.awsRequestId
    });

    // Return success response
    return createSuccessResponse(label);

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