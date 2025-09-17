import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../handlers/generate';

// Mock the utilities
jest.mock('../../utils/bedrock');
jest.mock('../../utils/dynamodb');

import { generateLabelWithRetry, BedrockError } from '../../utils/bedrock';
import { saveLabel, generateLabelId, DynamoDBError } from '../../utils/dynamodb';

const mockGenerateLabelWithRetry = generateLabelWithRetry as jest.MockedFunction<typeof generateLabelWithRetry>;
const mockSaveLabel = saveLabel as jest.MockedFunction<typeof saveLabel>;
const mockGenerateLabelId = generateLabelId as jest.MockedFunction<typeof generateLabelId>;

describe('Generate Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup default mocks
    mockGenerateLabelId.mockReturnValue('test_label_123');
    mockGenerateLabelWithRetry.mockResolvedValue({
      legalLabel: {
        ingredients: 'Water, Apple Juice',
        allergens: 'Contains: None',
        nutrition: {
          energy: { per100g: { value: 45, unit: 'kcal' } },
          fat: { per100g: { value: 0, unit: 'g' } },
          saturatedFat: { per100g: { value: 0, unit: 'g' } },
          carbohydrates: { per100g: { value: 11, unit: 'g' } },
          sugars: { per100g: { value: 10, unit: 'g' } },
          protein: { per100g: { value: 0, unit: 'g' } },
          salt: { per100g: { value: 0, unit: 'g' } }
        }
      },
      marketing: {
        short: 'Natural apple juice'
      },
      warnings: ['Keep refrigerated'],
      complianceNotes: ['EU Regulation compliant']
    });
    mockSaveLabel.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createMockEvent = (
    method: string = 'POST',
    body: string | null = null
  ): APIGatewayProxyEvent => ({
    httpMethod: method,
    body,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    path: '/generate',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      requestId: 'test-request-id',
      stage: 'test',
      resourceId: 'resource-id',
      httpMethod: method,
      resourcePath: '/generate',
      path: '/test/generate',
      accountId: '123456789012',
      apiId: 'api-id',
      protocol: 'HTTP/1.1',
      requestTime: '09/Apr/2015:12:34:56 +0000',
      requestTimeEpoch: 1428582896000,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'Custom User Agent String',
        userArn: null
      },
      authorizer: null
    },
    resource: '/generate'
  });

  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
    memoryLimitInMB: '1024',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test-function',
    logStreamName: '2023/09/17/[$LATEST]test-stream',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {}
  };

  describe('Successful generation', () => {
    it('should generate label successfully', async () => {
      const validProductData = {
        name: 'Test Juice',
        ingredients: ['Water', 'Apple Juice'],
        market: 'EU'
      };

      const event = createMockEvent('POST', JSON.stringify(validProductData));

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);

      const responseBody = JSON.parse(result.body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.data).toHaveProperty('labelId', 'test_label_123');
      expect(responseBody.data).toHaveProperty('labelData');
      expect(responseBody.data.market).toBe('EU');

      expect(mockGenerateLabelWithRetry).toHaveBeenCalledWith({
        productData: validProductData
      });
      expect(mockSaveLabel).toHaveBeenCalled();
    });

    it('should handle optional productId', async () => {
      const productDataWithId = {
        name: 'Test Product',
        ingredients: ['Water'],
        market: 'ES',
        productId: 'prod_123'
      };

      const event = createMockEvent('POST', JSON.stringify(productDataWithId));

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.data.productId).toBe('prod_123');
    });
  });

  describe('HTTP method validation', () => {
    it('should handle OPTIONS request', async () => {
      const event = createMockEvent('OPTIONS');

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(mockGenerateLabelWithRetry).not.toHaveBeenCalled();
    });

    it('should reject non-POST requests', async () => {
      const event = createMockEvent('GET');

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(405);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('METHOD_NOT_ALLOWED');
    });
  });

  describe('Input validation', () => {
    it('should reject missing request body', async () => {
      const event = createMockEvent('POST', null);

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('BAD_REQUEST');
    });

    it('should reject invalid JSON', async () => {
      const event = createMockEvent('POST', 'invalid json');

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('INVALID_JSON');
    });

    it('should reject invalid product data', async () => {
      const invalidData = {
        name: 'Test',
        // missing required ingredients
        market: 'INVALID_MARKET'
      };

      const event = createMockEvent('POST', JSON.stringify(invalidData));

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('Error handling', () => {
    it('should handle Bedrock errors', async () => {
      mockGenerateLabelWithRetry.mockRejectedValue(
        new BedrockError('AI service unavailable', 'generateLabelWithAI')
      );

      const validData = {
        name: 'Test Product',
        ingredients: ['Water'],
        market: 'EU'
      };

      const event = createMockEvent('POST', JSON.stringify(validData));

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(500);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('AI_GENERATION_ERROR');
    });

    it('should handle DynamoDB errors', async () => {
      mockSaveLabel.mockRejectedValue(
        new DynamoDBError('Table not found', 'saveLabel')
      );

      const validData = {
        name: 'Test Product',
        ingredients: ['Water'],
        market: 'EU'
      };

      const event = createMockEvent('POST', JSON.stringify(validData));

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(500);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('DATABASE_ERROR');
    });

    it('should handle timeout', async () => {
      // Mock a slow AI generation
      mockGenerateLabelWithRetry.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 15000))
      );

      const validData = {
        name: 'Test Product',
        ingredients: ['Water'],
        market: 'EU'
      };

      const event = createMockEvent('POST', JSON.stringify(validData));

      // Start the handler
      const handlerPromise = handler(event, mockContext);

      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(14000);

      const result = await handlerPromise;

      expect(result.statusCode).toBe(408);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('REQUEST_TIMEOUT');
    });

    it('should handle unexpected errors', async () => {
      mockGenerateLabelWithRetry.mockRejectedValue(new Error('Unexpected error'));

      const validData = {
        name: 'Test Product',
        ingredients: ['Water'],
        market: 'EU'
      };

      const event = createMockEvent('POST', JSON.stringify(validData));

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(500);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe('INTERNAL_ERROR');
    });
  });

  describe('Response format', () => {
    it('should include CORS headers', async () => {
      const validData = {
        name: 'Test Product',
        ingredients: ['Water'],
        market: 'EU'
      };

      const event = createMockEvent('POST', JSON.stringify(validData));

      const result = await handler(event, mockContext);

      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    });

    it('should format success response correctly', async () => {
      const validData = {
        name: 'Test Product',
        ingredients: ['Water'],
        market: 'EU'
      };

      const event = createMockEvent('POST', JSON.stringify(validData));

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      const responseBody = JSON.parse(result.body);

      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('data');
      expect(responseBody.data).toHaveProperty('labelId');
      expect(responseBody.data).toHaveProperty('labelData');
      expect(responseBody.data).toHaveProperty('market');
      expect(responseBody.data).toHaveProperty('createdAt');
      expect(responseBody.data).toHaveProperty('generatedBy', 'ai-bedrock-claude');
    });
  });
});