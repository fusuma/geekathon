import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HelloWorldResponse } from '@repo/shared';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Hello function invoked', { event });

  try {
    const response: HelloWorldResponse = {
      message: 'Hello from SmartLabel AI Steel Thread!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Api-Key',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error in hello handler:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process request',
      }),
    };
  }
};