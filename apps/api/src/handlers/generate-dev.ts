import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
}

interface Label {
  id: string;
  productName: string;
  ingredients: string;
  allergens: string[];
  nutritionalInfo: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
  };
  market: string;
  language: string;
  warnings: string[];
  complianceNotes: string[];
  generatedAt: string;
  version: string;
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

// Mock label generation for development
function generateMockLabel(productData: any): Label {
  const labelId = `label_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: labelId,
    productName: productData.name || 'Test Product',
    ingredients: productData.ingredients || 'water, sugar',
    allergens: productData.allergens || [],
    nutritionalInfo: productData.nutritionalInfo || {
      calories: 100,
      fat: 0,
      carbs: 25,
      protein: 0,
    },
    market: productData.market || 'EU',
    language: productData.language || 'EN',
    warnings: [
      'This is a mock label for development purposes',
      'Contains: water, sugar',
    ],
    complianceNotes: [
      'Mock compliance note for development',
    ],
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
  };
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: any
): Promise<APIGatewayProxyResult> => {
  console.log('Generate handler called with event:', JSON.stringify(event, null, 2));

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return createResponse(200, { success: true, data: {} as Label });
    }

    // Validate HTTP method
    if (event.httpMethod !== 'POST') {
      return createResponse(405, {
        error: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      });
    }

    // Parse and validate request body
    if (!event.body) {
      return createResponse(400, {
        error: 'INVALID_REQUEST',
        message: 'Request body is required',
      });
    }

    let productData;
    try {
      productData = JSON.parse(event.body);
    } catch (parseError) {
      return createResponse(400, {
        error: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error',
      });
    }

    // Basic validation
    if (!productData.name || !productData.ingredients) {
      return createResponse(400, {
        error: 'VALIDATION_ERROR',
        message: 'Product name and ingredients are required',
      });
    }

    // Generate mock label
    const label = generateMockLabel(productData);

    console.log('Generated mock label:', JSON.stringify(label, null, 2));

    return createResponse(200, {
      success: true,
      data: label,
    });

  } catch (error) {
    console.error('Unexpected error in generate handler:', error);
    
    return createResponse(500, {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
