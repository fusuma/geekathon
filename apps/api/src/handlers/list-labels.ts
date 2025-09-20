import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

interface MockLabel {
  labelId: string;
  productName: string;
  market: string;
  createdAt: string;
  status: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('List labels handler started', { 
    requestId: context.awsRequestId,
    method: event.httpMethod,
    path: event.path
  });

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
        },
        body: JSON.stringify({ success: true, data: {} }),
      };
    }

    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Return mock data for testing
    const mockLabels: MockLabel[] = [
      {
        labelId: 'label-001',
        productName: 'Test Product 1',
        market: 'US',
        createdAt: new Date().toISOString(),
        status: 'active'
      },
      {
        labelId: 'label-002',
        productName: 'Test Product 2',
        market: 'BR',
        createdAt: new Date().toISOString(),
        status: 'active'
      }
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: mockLabels,
        count: mockLabels.length
      }),
    };

  } catch (error) {
    console.error('Error in list labels handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while retrieving labels'
      }),
    };
  }
};
