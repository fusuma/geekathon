import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  PutCommandInput,
  GetCommandInput,
  QueryCommandInput
} from '@aws-sdk/lib-dynamodb';
import { Label, Market } from '@repo/shared';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.LABELS_TABLE;

if (!TABLE_NAME) {
  throw new Error('LABELS_TABLE environment variable is not set');
}

export interface SaveLabelParams {
  label: Label;
}

export interface GetLabelParams {
  labelId: string;
}

export interface GetLabelsByProductParams {
  productId: string;
  limit?: number;
}

export interface GetLabelsByMarketParams {
  market: Market;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetLabelsByMarketAndProductParams {
  market: Market;
  productId: string;
  limit?: number;
}

export class DynamoDBError extends Error {
  constructor(message: string, public readonly operation: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DynamoDBError';
  }
}

export async function saveLabel(params: SaveLabelParams): Promise<void> {
  const { label } = params;

  try {
    const input: PutCommandInput = {
      TableName: TABLE_NAME,
      Item: label,
      ConditionExpression: 'attribute_not_exists(labelId)',
    };

    const command = new PutCommand(input);
    await docClient.send(command);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to save label ${label.labelId}: ${errorMessage}`,
      'saveLabel',
      error instanceof Error ? error : undefined
    );
  }
}

export async function getLabel(params: GetLabelParams): Promise<Label | null> {
  const { labelId } = params;

  try {
    const input: GetCommandInput = {
      TableName: TABLE_NAME,
      Key: {
        labelId,
      },
    };

    const command = new GetCommand(input);
    const result = await docClient.send(command);

    return result.Item as Label || null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to get label ${labelId}: ${errorMessage}`,
      'getLabel',
      error instanceof Error ? error : undefined
    );
  }
}

export async function getLabelsByProduct(params: GetLabelsByProductParams): Promise<Label[]> {
  const { productId, limit = 50 } = params;

  try {
    const input: QueryCommandInput = {
      TableName: TABLE_NAME,
      IndexName: 'by-product',
      KeyConditionExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId,
      },
      Limit: limit,
      ScanIndexForward: false, // Sort by creation time descending
    };

    const command = new QueryCommand(input);
    const result = await docClient.send(command);

    return (result.Items as Label[]) || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to get labels for product ${productId}: ${errorMessage}`,
      'getLabelsByProduct',
      error instanceof Error ? error : undefined
    );
  }
}

export async function getLabelsByMarket(params: GetLabelsByMarketParams): Promise<Label[]> {
  const { market, limit = 50, startDate, endDate } = params;

  try {
    let keyConditionExpression = 'market = :market';
    const expressionAttributeValues: Record<string, any> = {
      ':market': market,
    };

    // Add date range filtering if provided
    if (startDate && endDate) {
      keyConditionExpression += ' AND createdAt BETWEEN :startDate AND :endDate';
      expressionAttributeValues[':startDate'] = startDate;
      expressionAttributeValues[':endDate'] = endDate;
    } else if (startDate) {
      keyConditionExpression += ' AND createdAt >= :startDate';
      expressionAttributeValues[':startDate'] = startDate;
    }

    const input: QueryCommandInput = {
      TableName: TABLE_NAME,
      IndexName: 'by-market',
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: limit,
      ScanIndexForward: false, // Sort by creation time descending
    };

    const command = new QueryCommand(input);
    const result = await docClient.send(command);

    return (result.Items as Label[]) || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to get labels for market ${market}: ${errorMessage}`,
      'getLabelsByMarket',
      error instanceof Error ? error : undefined
    );
  }
}

export async function getLabelsByMarketAndProduct(params: GetLabelsByMarketAndProductParams): Promise<Label[]> {
  const { market, productId, limit = 50 } = params;

  try {
    const input: QueryCommandInput = {
      TableName: TABLE_NAME,
      IndexName: 'by-market-product',
      KeyConditionExpression: 'market = :market AND productId = :productId',
      ExpressionAttributeValues: {
        ':market': market,
        ':productId': productId,
      },
      Limit: limit,
      ScanIndexForward: false, // Sort by creation time descending
    };

    const command = new QueryCommand(input);
    const result = await docClient.send(command);

    return (result.Items as Label[]) || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to get labels for market ${market} and product ${productId}: ${errorMessage}`,
      'getLabelsByMarketAndProduct',
      error instanceof Error ? error : undefined
    );
  }
}

// Helper function to generate unique label ID
export function generateLabelId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `label_${timestamp}_${random}`;
}