import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  PutCommandInput,
  GetCommandInput,
  QueryCommandInput,
  UpdateCommandInput
} from '@aws-sdk/lib-dynamodb';
import { Label, Market, CrisisLog, CrisisType, CrisisSeverity } from '@repo/shared';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.LABELS_TABLE;
const CRISIS_LOGS_TABLE = process.env.CRISIS_LOGS_TABLE || 'SmartLabel-CrisisLogs';

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

// Crisis Logging Functions

export interface SaveCrisisLogParams {
  crisisLog: CrisisLog;
}

export interface GetCrisisLogParams {
  crisisId: string;
}

export interface GetCrisisLogsByProductParams {
  productId: string;
  limit?: number;
}

export interface GetCrisisLogsByTypeParams {
  crisisType: CrisisType;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetCrisisLogsByTimeRangeParams {
  startDate: string;
  endDate: string;
  limit?: number;
}

/**
 * Save a crisis log to DynamoDB for audit trail
 */
export async function saveCrisisLog(params: SaveCrisisLogParams): Promise<void> {
  const { crisisLog } = params;

  try {
    const input: PutCommandInput = {
      TableName: CRISIS_LOGS_TABLE,
      Item: crisisLog,
      ConditionExpression: 'attribute_not_exists(crisisId)',
    };

    const command = new PutCommand(input);
    await docClient.send(command);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to save crisis log ${crisisLog.crisisId}: ${errorMessage}`,
      'saveCrisisLog',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get a crisis log by crisis ID
 */
export async function getCrisisLog(params: GetCrisisLogParams): Promise<CrisisLog | null> {
  const { crisisId } = params;

  try {
    const input: GetCommandInput = {
      TableName: CRISIS_LOGS_TABLE,
      Key: {
        crisisId,
      },
    };

    const command = new GetCommand(input);
    const result = await docClient.send(command);

    return result.Item as CrisisLog || null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to get crisis log ${crisisId}: ${errorMessage}`,
      'getCrisisLog',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get crisis logs by product ID for impact analysis
 */
export async function getCrisisLogsByProduct(params: GetCrisisLogsByProductParams): Promise<CrisisLog[]> {
  const { productId, limit = 50 } = params;

  try {
    const input: QueryCommandInput = {
      TableName: CRISIS_LOGS_TABLE,
      IndexName: 'by-product',
      KeyConditionExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId,
      },
      Limit: limit,
      ScanIndexForward: false, // Sort by timestamp descending
    };

    const command = new QueryCommand(input);
    const result = await docClient.send(command);

    return (result.Items as CrisisLog[]) || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to get crisis logs for product ${productId}: ${errorMessage}`,
      'getCrisisLogsByProduct',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get crisis logs by crisis type for pattern analysis
 */
export async function getCrisisLogsByType(params: GetCrisisLogsByTypeParams): Promise<CrisisLog[]> {
  const { crisisType, limit = 50, startDate, endDate } = params;

  try {
    let keyConditionExpression = 'crisisType = :crisisType';
    const expressionAttributeValues: Record<string, any> = {
      ':crisisType': crisisType,
    };

    // Add date range filtering if provided
    if (startDate && endDate) {
      keyConditionExpression += ' AND #timestamp BETWEEN :startDate AND :endDate';
      expressionAttributeValues[':startDate'] = startDate;
      expressionAttributeValues[':endDate'] = endDate;
    } else if (startDate) {
      keyConditionExpression += ' AND #timestamp >= :startDate';
      expressionAttributeValues[':startDate'] = startDate;
    }

    const input: QueryCommandInput = {
      TableName: CRISIS_LOGS_TABLE,
      IndexName: 'by-crisis-type',
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: {
        '#timestamp': 'timestamp'
      },
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: limit,
      ScanIndexForward: false, // Sort by timestamp descending
    };

    const command = new QueryCommand(input);
    const result = await docClient.send(command);

    return (result.Items as CrisisLog[]) || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to get crisis logs for type ${crisisType}: ${errorMessage}`,
      'getCrisisLogsByType',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get recent crisis logs for dashboard and reporting
 */
export async function getRecentCrisisLogs(limit: number = 20): Promise<CrisisLog[]> {
  try {
    const input: QueryCommandInput = {
      TableName: CRISIS_LOGS_TABLE,
      IndexName: 'by-timestamp',
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'type',
        '#timestamp': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':pk': 'CRISIS_LOG', // Use a constant partition key for global index
      },
      Limit: limit,
      ScanIndexForward: false, // Sort by timestamp descending
    };

    const command = new QueryCommand(input);
    const result = await docClient.send(command);

    return (result.Items as CrisisLog[]) || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to get recent crisis logs: ${errorMessage}`,
      'getRecentCrisisLogs',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Update crisis log with resolution information
 */
export async function updateCrisisLogResolution(
  crisisId: string,
  resolvedAt: string,
  impactAssessment?: string
): Promise<void> {
  try {
    const updateExpression = 'SET resolvedAt = :resolvedAt' +
      (impactAssessment ? ', impactAssessment = :impactAssessment' : '');

    const expressionAttributeValues: Record<string, any> = {
      ':resolvedAt': resolvedAt,
    };

    if (impactAssessment) {
      expressionAttributeValues[':impactAssessment'] = impactAssessment;
    }

    const input: UpdateCommandInput = {
      TableName: CRISIS_LOGS_TABLE,
      Key: { crisisId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(crisisId)',
    };

    const command = new UpdateCommand(input);
    await docClient.send(command);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to update crisis log resolution ${crisisId}: ${errorMessage}`,
      'updateCrisisLogResolution',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Generate crisis statistics for reporting
 */
export async function getCrisisStatistics(
  startDate: string,
  endDate: string
): Promise<{
  totalCrises: number;
  byType: Record<CrisisType, number>;
  bySeverity: Record<CrisisSeverity, number>;
  avgResolutionTime: number;
}> {
  try {
    const input: QueryCommandInput = {
      TableName: CRISIS_LOGS_TABLE,
      IndexName: 'by-timestamp',
      KeyConditionExpression: '#pk = :pk AND #timestamp BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#pk': 'type',
        '#timestamp': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':pk': 'CRISIS_LOG',
        ':startDate': startDate,
        ':endDate': endDate,
      },
    };

    const command = new QueryCommand(input);
    const result = await docClient.send(command);
    const logs = (result.Items as CrisisLog[]) || [];

    const stats = {
      totalCrises: logs.length,
      byType: {} as Record<CrisisType, number>,
      bySeverity: {} as Record<CrisisSeverity, number>,
      avgResolutionTime: 0
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    logs.forEach(log => {
      // Count by type
      stats.byType[log.crisisType] = (stats.byType[log.crisisType] || 0) + 1;

      // Count by severity
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;

      // Calculate resolution time
      if (log.resolvedAt) {
        const created = new Date(log.timestamp).getTime();
        const resolved = new Date(log.resolvedAt).getTime();
        totalResolutionTime += resolved - created;
        resolvedCount++;
      }
    });

    if (resolvedCount > 0) {
      stats.avgResolutionTime = Math.round(totalResolutionTime / resolvedCount / (1000 * 60 * 60)); // hours
    }

    return stats;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DynamoDBError(
      `Failed to get crisis statistics: ${errorMessage}`,
      'getCrisisStatistics',
      error instanceof Error ? error : undefined
    );
  }
}

// Helper function to generate unique crisis ID
export function generateCrisisId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `crisis_${timestamp}_${random}`;
}