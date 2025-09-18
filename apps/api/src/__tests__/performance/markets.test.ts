// Mock environment variables
process.env.LABELS_TABLE = 'test-labels-table';

import { handler } from '../../handlers/generate';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Mock the external dependencies
jest.mock('../../utils/bedrock');
jest.mock('../../utils/dynamodb');

import { generateLabelWithRetry } from '../../utils/bedrock';
import { saveLabel } from '../../utils/dynamodb';

const mockGenerateLabelWithRetry = generateLabelWithRetry as jest.MockedFunction<typeof generateLabelWithRetry>;
const mockSaveLabel = saveLabel as jest.MockedFunction<typeof saveLabel>;

describe('Market Performance Tests', () => {
  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test',
    logStreamName: 'test-stream',
    getRemainingTimeInMillis: () => 30000,
    done: jest.fn(),
    fail: jest.fn(),
    succeed: jest.fn()
  };

  const baseEvent: Partial<APIGatewayProxyEvent> = {
    httpMethod: 'POST',
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    isBase64Encoded: false,
    path: '/generate',
    resource: '/generate'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful AI generation
    mockGenerateLabelWithRetry.mockResolvedValue({
      labelData: {
        legalLabel: {
          ingredients: 'Test ingredients',
          allergens: 'Contains: milk',
          nutrition: { energy: { per100g: '100 kcal' }, fat: { per100g: '1g' } }
        },
        marketing: { short: 'Test product' },
        complianceNotes: ['Test compliance'],
        warnings: []
      },
      marketSpecificData: {
        certifications: ['Test cert'],
        localRegulations: ['Test regulation'],
        culturalConsiderations: ['Test culture'],
        languageVariant: 'en'
      },
      language: 'en' as const,
      translatedData: undefined
    });

    // Mock successful database save
    mockSaveLabel.mockResolvedValue(undefined);
  });

  const markets = ['US', 'UK', 'ES', 'AO', 'MO', 'BR', 'AE'];

  describe('Performance across all markets', () => {
    markets.forEach(market => {
      test(`Should generate label for ${market} market within 15 seconds`, async () => {
        const event: APIGatewayProxyEvent = {
          ...baseEvent,
          body: JSON.stringify({
            name: 'Test Product',
            market,
            ingredients: ['ingredient1', 'ingredient2'],
            allergens: ['milk'],
            nutrition: { energy: 100, fat: 1 }
          })
        } as APIGatewayProxyEvent;

        const startTime = Date.now();
        const result = await handler(event, mockContext);
        const duration = Date.now() - startTime;

        expect(result.statusCode).toBe(200);
        expect(duration).toBeLessThan(15000); // 15 second requirement

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.data.market).toBe(market);
        expect(body.data.metadata.meetsTarget).toBe(true);
        expect(body.data.metadata.generationTime).toBeLessThan(15000);
      });
    });
  });

  describe('Portuguese market performance', () => {
    const portugueseMarkets = ['AO', 'BR'];

    portugueseMarkets.forEach(market => {
      test(`Should handle Portuguese translation for ${market} within performance limits`, async () => {
        // Mock translation response
        mockGenerateLabelWithRetry.mockResolvedValue({
          labelData: {
            legalLabel: {
              ingredients: 'Test ingredients',
              allergens: 'Contains: milk',
              nutrition: { energy: { per100g: '100 kcal' }, fat: { per100g: '1g' } }
            },
            marketing: { short: 'Test product' },
            complianceNotes: ['Test compliance'],
            warnings: []
          },
          marketSpecificData: {
            certifications: ['Test cert'],
            localRegulations: ['Test regulation'],
            culturalConsiderations: ['Test culture'],
            languageVariant: 'pt'
          },
          language: 'pt' as const,
          translatedData: {
            legalLabel: {
              ingredients: 'Ingredientes de teste',
              allergens: 'Contém: leite',
              nutrition: { energy: { per100g: '100 kcal' }, fat: { per100g: '1g' } }
            },
            marketing: { short: 'Produto de teste' },
            complianceNotes: ['Conformidade de teste'],
            warnings: []
          }
        });

        const event: APIGatewayProxyEvent = {
          ...baseEvent,
          body: JSON.stringify({
            name: 'Test Product',
            market,
            ingredients: ['ingredient1', 'ingredient2'],
            allergens: ['milk'],
            nutrition: { energy: 100, fat: 1 }
          })
        } as APIGatewayProxyEvent;

        const startTime = Date.now();
        const result = await handler(event, mockContext);
        const duration = Date.now() - startTime;

        expect(result.statusCode).toBe(200);
        expect(duration).toBeLessThan(15000);

        const body = JSON.parse(result.body);
        expect(body.data.hasTranslation).toBeTruthy();
        expect(body.data.language).toBe('pt');
        expect(body.data.translatedData).toBeDefined();
      });
    });
  });

  describe('Performance monitoring', () => {
    test('Should log performance warning for slow requests', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock a slow response (12+ seconds)
      mockGenerateLabelWithRetry.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            labelData: {
              legalLabel: {
                ingredients: 'Test ingredients',
                allergens: 'Contains: milk',
                nutrition: { energy: { per100g: '100 kcal' }, fat: { per100g: '1g' } }
              },
              marketing: { short: 'Test product' },
              complianceNotes: ['Test compliance'],
              warnings: []
            },
            marketSpecificData: {
              certifications: ['Test cert'],
              localRegulations: ['Test regulation'],
              culturalConsiderations: ['Test culture'],
              languageVariant: 'en'
            },
            language: 'en' as const,
            translatedData: undefined
          }), 12500)
        )
      );

      const event: APIGatewayProxyEvent = {
        ...baseEvent,
        body: JSON.stringify({
          name: 'Test Product',
          market: 'US',
          ingredients: ['ingredient1'],
          allergens: [],
          nutrition: { energy: 100 }
        })
      } as APIGatewayProxyEvent;

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance warning'),
        expect.objectContaining({
          market: 'US',
          duration: expect.any(Number)
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Timeout handling', () => {
    test('Should timeout after 14 seconds', async () => {
      // Mock a very slow response that would exceed timeout
      mockGenerateLabelWithRetry.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          labelData: {
            legalLabel: {
              ingredients: 'Test ingredients',
              allergens: 'Contains: milk',
              nutrition: { energy: { per100g: '100 kcal' }, fat: { per100g: '1g' } }
            },
            marketing: { short: 'Test product' },
            complianceNotes: ['Test compliance'],
            warnings: []
          },
          marketSpecificData: {
            certifications: ['Test cert'],
            localRegulations: ['Test regulation'],
            culturalConsiderations: ['Test culture'],
            languageVariant: 'en'
          },
          language: 'en' as const,
          translatedData: undefined
        }), 15000))
      );

      const event: APIGatewayProxyEvent = {
        ...baseEvent,
        body: JSON.stringify({
          name: 'Test Product',
          market: 'US',
          ingredients: ['ingredient1'],
          allergens: [],
          nutrition: { energy: 100 }
        })
      } as APIGatewayProxyEvent;

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(408);
      expect(JSON.parse(result.body).error).toBe('REQUEST_TIMEOUT');
    });
  });
});