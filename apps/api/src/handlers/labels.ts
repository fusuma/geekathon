import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
}

interface SuccessResponse {
  success: boolean;
  data: any;
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
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
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

function createSuccessResponse(data: any): APIGatewayProxyResult {
  return createResponse(200, {
    success: true,
    data
  });
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Labels handler started', { 
    requestId: context.awsRequestId,
    method: event.httpMethod,
    path: event.path,
    environment: process.env.NODE_ENV,
    labelsTable: process.env.LABELS_TABLE
  });

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return createResponse(200, { success: true, data: {} });
    }

    const tableName = process.env.LABELS_TABLE;
    console.log('Table name from environment:', tableName);
    
    if (!tableName) {
      console.error('LABELS_TABLE environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Labels table not configured');
    }

    // Extract labelId from path parameters
    const labelId = event.pathParameters?.labelId;

    if (event.httpMethod === 'GET') {
      if (labelId) {
        // Get specific label
        return await getLabel(tableName, labelId);
      } else {
        // Get all labels
        return await getAllLabels(tableName);
      }
    } else if (event.httpMethod === 'DELETE') {
      if (!labelId) {
        return createErrorResponse(400, 'BAD_REQUEST', 'Label ID is required for deletion');
      }
      return await deleteLabel(tableName, labelId);
    } else {
      return createErrorResponse(405, 'METHOD_NOT_ALLOWED', 'Only GET and DELETE methods are allowed');
    }

  } catch (error) {
    console.error('Unhandled error in labels handler:', error);
    return createErrorResponse(
      500,
      'INTERNAL_ERROR',
      'An unexpected error occurred'
    );
  }
};

async function getLabel(tableName: string, labelId: string): Promise<APIGatewayProxyResult> {
  try {
    console.log('Getting label', { labelId });
    
    const command = new GetCommand({
      TableName: tableName,
      Key: { labelId }
    });

    const result = await docClient.send(command);
    
    if (!result.Item) {
      return createErrorResponse(404, 'NOT_FOUND', 'Label not found');
    }

    console.log('Label retrieved successfully', { labelId });
    return createSuccessResponse(result.Item);

  } catch (error) {
    console.error('Error getting label:', error);
    return createErrorResponse(500, 'DATABASE_ERROR', 'Failed to retrieve label');
  }
}

async function getAllLabels(tableName: string): Promise<APIGatewayProxyResult> {
  try {
    console.log('Getting all labels');
    
    const command = new ScanCommand({
      TableName: tableName
    });

    const result = await docClient.send(command);
    
    console.log('Labels retrieved successfully', { count: result.Items?.length || 0 });
    return createSuccessResponse(result.Items || []);

  } catch (error) {
    console.error('Error getting labels:', error);
    return createErrorResponse(500, 'DATABASE_ERROR', 'Failed to retrieve labels');
  }
}

async function deleteLabel(tableName: string, labelId: string): Promise<APIGatewayProxyResult> {
  try {
    console.log('Deleting label', { labelId });
    
    // First check if label exists
    const getCommand = new GetCommand({
      TableName: tableName,
      Key: { labelId }
    });

    const getResult = await docClient.send(getCommand);
    
    if (!getResult.Item) {
      return createErrorResponse(404, 'NOT_FOUND', 'Label not found');
    }

    // Delete the label
    const deleteCommand = new DeleteCommand({
      TableName: tableName,
      Key: { labelId }
    });

    await docClient.send(deleteCommand);
    
    console.log('Label deleted successfully', { labelId });
    return createSuccessResponse({ message: 'Label deleted successfully', labelId });

  } catch (error) {
    console.error('Error deleting label:', error);
    return createErrorResponse(500, 'DATABASE_ERROR', 'Failed to delete label');
  }
}
