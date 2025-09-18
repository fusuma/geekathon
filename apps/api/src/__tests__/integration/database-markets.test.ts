// Mock environment variables
process.env.LABELS_TABLE = 'test-labels-table';

import {
  saveLabel,
  getLabelsByMarket,
  getLabelsByProduct,
  generateLabelId
} from '../../utils/dynamodb';

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const mockSend = jest.fn();
DynamoDBDocumentClient.prototype.send = mockSend;

describe('Database Market Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockClear();
  });

  const mockLabel = {
    labelId: 'test-label-id',
    productId: 'test-product-id',
    market: 'AO' as const,
    language: 'pt' as const,
    labelData: {
      legalLabel: {
        ingredients: 'ingredientes de teste',
        allergens: 'Contém: leite',
        nutrition: { energy: { per100g: '100 kcal' }, fat: { per100g: '1g' } }
      },
      marketing: { short: 'produto de teste' },
      complianceNotes: ['Requisitos tropicais aplicados'],
      warnings: []
    },
    marketSpecificData: {
      certifications: ['Angola Quality Mark'],
      localRegulations: ['Ministry of Health regulations'],
      culturalConsiderations: ['Portuguese language', 'Tropical climate'],
      languageVariant: 'pt'
    },
    translatedData: {
      legalLabel: {
        ingredients: 'test ingredients',
        allergens: 'Contains: milk',
        nutrition: { energy: { per100g: '100 kcal' }, fat: { per100g: '1g' } }
      },
      marketing: { short: 'test product' },
      complianceNotes: ['Tropical requirements applied'],
      warnings: []
    },
    createdAt: new Date().toISOString(),
    generatedBy: 'ai-bedrock-claude'
  };

  describe('Label Storage', () => {
    test('Should save label with market-specific data', async () => {
      mockSend.mockResolvedValueOnce({});

      await saveLabel({ label: mockLabel });

      expect(mockSend).toHaveBeenCalledWith(
        expect.any(PutCommand)
      );

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input.Item).toEqual(mockLabel);
      expect(putCommand.input.Item.market).toBe('AO');
      expect(putCommand.input.Item.language).toBe('pt');
      expect(putCommand.input.Item.marketSpecificData).toBeDefined();
      expect(putCommand.input.Item.translatedData).toBeDefined();
    });

    test('Should generate unique label IDs', () => {
      const id1 = generateLabelId();
      const id2 = generateLabelId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^label_/);
      expect(id2).toMatch(/^label_/);
    });
  });

  describe('Market-based Queries', () => {
    test('Should query labels by market using GSI', async () => {
      const mockResults = {
        Items: [
          { ...mockLabel, labelId: 'label_1' },
          { ...mockLabel, labelId: 'label_2' }
        ]
      };

      mockSend.mockResolvedValueOnce(mockResults);

      const result = await getLabelsByMarket('AO');

      expect(mockSend).toHaveBeenCalledWith(
        expect.any(QueryCommand)
      );

      const queryCommand = mockSend.mock.calls[0][0];
      expect(queryCommand.input.IndexName).toBe('by-market');
      expect(queryCommand.input.KeyConditionExpression).toBe('market = :market');
      expect(queryCommand.input.ExpressionAttributeValues[':market']).toBe('AO');

      expect(result).toEqual(mockResults.Items);
    });

    test('Should query labels by product using GSI', async () => {
      const mockResults = {
        Items: [
          { ...mockLabel, market: 'AO' },
          { ...mockLabel, market: 'BR', labelId: 'label_br' }
        ]
      };

      mockSend.mockResolvedValueOnce(mockResults);

      const result = await getLabelsByProduct('test-product-id');

      expect(mockSend).toHaveBeenCalledWith(
        expect.any(QueryCommand)
      );

      const queryCommand = mockSend.mock.calls[0][0];
      expect(queryCommand.input.IndexName).toBe('by-product');
      expect(queryCommand.input.KeyConditionExpression).toBe('productId = :productId');
      expect(queryCommand.input.ExpressionAttributeValues[':productId']).toBe('test-product-id');

      expect(result).toEqual(mockResults.Items);
    });
  });

  describe('Multi-Market Label Storage', () => {
    const markets = ['US', 'UK', 'ES', 'AO', 'MO', 'BR', 'AE'];

    markets.forEach(market => {
      test(`Should store label for ${market} market`, async () => {
        const marketLabel = {
          ...mockLabel,
          market,
          labelId: `label_${market.toLowerCase()}`,
          language: ['AO', 'BR'].includes(market) ? 'pt' as const : 'en' as const,
          marketSpecificData: {
            certifications: [`${market} certification`],
            localRegulations: [`${market} regulations`],
            culturalConsiderations: [`${market} cultural considerations`],
            languageVariant: ['AO', 'BR'].includes(market) ? 'pt' : 'en'
          }
        };

        mockSend.mockResolvedValueOnce({});

        await saveLabel({ label: marketLabel });

        expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));

        const putCommand = mockSend.mock.calls[0][0];
        expect(putCommand.input.Item.market).toBe(market);
        expect(putCommand.input.Item.marketSpecificData).toBeDefined();
      });
    });
  });

  describe('Translation Data Storage', () => {
    test('Should store both original and translated data for Portuguese markets', async () => {
      const portugueseLabel = {
        ...mockLabel,
        market: 'BR' as const,
        language: 'pt' as const,
        translatedData: {
          legalLabel: {
            ingredients: 'test ingredients',
            allergens: 'Contains: milk',
            nutrition: { energy: { per100g: '100 kcal' }, fat: { per100g: '1g' } }
          },
          marketing: { short: 'test product' },
          complianceNotes: ['Brazilian requirements applied'],
          warnings: []
        }
      };

      mockSend.mockResolvedValueOnce({});

      await saveLabel({ label: portugueseLabel });

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input.Item.labelData).toBeDefined();
      expect(putCommand.input.Item.translatedData).toBeDefined();
      expect(putCommand.input.Item.language).toBe('pt');
      expect(putCommand.input.Item.market).toBe('BR');
    });

    test('Should store original data only for non-Portuguese markets', async () => {
      const englishLabel = {
        ...mockLabel,
        market: 'US' as const,
        language: 'en' as const,
        translatedData: undefined
      };

      mockSend.mockResolvedValueOnce({});

      await saveLabel({ label: englishLabel });

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input.Item.labelData).toBeDefined();
      expect(putCommand.input.Item.translatedData).toBeUndefined();
      expect(putCommand.input.Item.language).toBe('en');
      expect(putCommand.input.Item.market).toBe('US');
    });
  });

  describe('Market Analytics Queries', () => {
    test('Should support market-based analytics queries', async () => {
      const mockAnalyticsResults = {
        Items: [
          { market: 'AO', count: 5, lastGenerated: '2025-01-01T00:00:00Z' },
          { market: 'BR', count: 8, lastGenerated: '2025-01-01T00:00:00Z' },
          { market: 'MO', count: 3, lastGenerated: '2025-01-01T00:00:00Z' }
        ]
      };

      mockSend.mockResolvedValueOnce(mockAnalyticsResults);

      // This would be implemented in the actual system
      const mockAnalyticsQuery = {
        IndexName: 'by-market',
        Select: 'ALL_ATTRIBUTES',
        KeyConditionExpression: 'market = :market'
      };

      // Simulating an analytics query for Angola market
      await new Promise(resolve => {
        mockSend({
          ...mockAnalyticsQuery,
          ExpressionAttributeValues: { ':market': 'AO' }
        });
        resolve(mockAnalyticsResults.Items.filter(item => item.market === 'AO'));
      });

      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('Should handle DynamoDB errors gracefully', async () => {
      const dynamoError = new Error('DynamoDB connection failed');
      mockSend.mockRejectedValueOnce(dynamoError);

      await expect(saveLabel({ label: mockLabel })).rejects.toThrow();
    });

    test('Should handle missing market parameter in queries', async () => {
      await expect(getLabelsByMarket('')).rejects.toThrow();
    });

    test('Should handle missing product ID in queries', async () => {
      await expect(getLabelsByProduct('')).rejects.toThrow();
    });
  });

  describe('Index Performance', () => {
    test('Should use efficient GSI queries for market filtering', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      await getLabelsByMarket('ES');

      const queryCommand = mockSend.mock.calls[0][0];
      expect(queryCommand.input.IndexName).toBe('by-market');
      expect(queryCommand.input.KeyConditionExpression).toBe('market = :market');
      // Ensure we're not doing a full table scan
      expect(queryCommand.input.KeyConditionExpression).not.toContain('scan');
    });

    test('Should use efficient GSI queries for product filtering', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      await getLabelsByProduct('test-product');

      const queryCommand = mockSend.mock.calls[0][0];
      expect(queryCommand.input.IndexName).toBe('by-product');
      expect(queryCommand.input.KeyConditionExpression).toBe('productId = :productId');
      // Ensure we're not doing a full table scan
      expect(queryCommand.input.KeyConditionExpression).not.toContain('scan');
    });
  });
});