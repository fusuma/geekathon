import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { saveLabel, getLabel, getLabelsByProduct, generateLabelId, DynamoDBError } from '../../utils/dynamodb';
import { Label } from '@repo/shared';

// Mock the DynamoDB client
const ddbMock = mockClient(DynamoDBDocumentClient);

// Mock environment variable
process.env.LABELS_TABLE = 'test-labels-table';

describe('DynamoDB Utils', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('saveLabel', () => {
    const mockLabel: Label = {
      labelId: 'test_label_123',
      productId: 'prod_456',
      labelData: {
        legalLabel: {
          ingredients: 'Water, Sugar',
          allergens: 'None',
          nutrition: {
            energy: { per100g: { value: 250, unit: 'kcal' } }
          }
        },
        marketing: { short: 'Test product' },
        warnings: [],
        complianceNotes: ['EU compliant']
      },
      market: 'EU',
      createdAt: '2023-09-17T10:00:00Z',
      generatedBy: 'ai-bedrock-claude'
    };

    it('should save label successfully', async () => {
      ddbMock.on(PutCommand).resolves({});

      await expect(saveLabel({ label: mockLabel })).resolves.toBeUndefined();

      expect(ddbMock.call(0).args[0].input).toMatchObject({
        TableName: 'test-labels-table',
        Item: mockLabel,
        ConditionExpression: 'attribute_not_exists(labelId)'
      });
    });

    it('should throw DynamoDBError on save failure', async () => {
      const errorMessage = 'ConditionalCheckFailedException';
      ddbMock.on(PutCommand).rejects(new Error(errorMessage));

      await expect(saveLabel({ label: mockLabel })).rejects.toThrow(DynamoDBError);
      await expect(saveLabel({ label: mockLabel })).rejects.toThrow(errorMessage);
    });
  });

  describe('getLabel', () => {
    it('should return label when found', async () => {
      const mockLabel: Label = {
        labelId: 'test_label_123',
        labelData: {
          legalLabel: {
            ingredients: 'Water',
            allergens: 'None',
            nutrition: {}
          },
          marketing: { short: 'Test' },
          warnings: [],
          complianceNotes: []
        },
        market: 'EU',
        createdAt: '2023-09-17T10:00:00Z',
        generatedBy: 'ai-bedrock-claude'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockLabel
      });

      const result = await getLabel({ labelId: 'test_label_123' });

      expect(result).toEqual(mockLabel);
      expect(ddbMock.call(0).args[0].input).toMatchObject({
        TableName: 'test-labels-table',
        Key: { labelId: 'test_label_123' }
      });
    });

    it('should return null when label not found', async () => {
      ddbMock.on(GetCommand).resolves({});

      const result = await getLabel({ labelId: 'nonexistent' });

      expect(result).toBeNull();
    });

    it('should throw DynamoDBError on get failure', async () => {
      ddbMock.on(GetCommand).rejects(new Error('InternalServerError'));

      await expect(getLabel({ labelId: 'test' })).rejects.toThrow(DynamoDBError);
    });
  });

  describe('getLabelsByProduct', () => {
    it('should return labels for product', async () => {
      const mockLabels = [
        {
          labelId: 'label_1',
          productId: 'prod_123',
          market: 'EU'
        },
        {
          labelId: 'label_2',
          productId: 'prod_123',
          market: 'ES'
        }
      ];

      ddbMock.on(QueryCommand).resolves({
        Items: mockLabels
      });

      const result = await getLabelsByProduct({ productId: 'prod_123' });

      expect(result).toEqual(mockLabels);
      expect(ddbMock.call(0).args[0].input).toMatchObject({
        TableName: 'test-labels-table',
        IndexName: 'by-product',
        KeyConditionExpression: 'productId = :productId',
        ExpressionAttributeValues: {
          ':productId': 'prod_123'
        },
        Limit: 50,
        ScanIndexForward: false
      });
    });

    it('should return empty array when no labels found', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: []
      });

      const result = await getLabelsByProduct({ productId: 'nonexistent' });

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      ddbMock.on(QueryCommand).resolves({ Items: [] });

      await getLabelsByProduct({ productId: 'prod_123', limit: 10 });

      expect(ddbMock.call(0).args[0].input.Limit).toBe(10);
    });
  });

  describe('generateLabelId', () => {
    it('should generate unique label IDs', () => {
      const id1 = generateLabelId();
      const id2 = generateLabelId();

      expect(id1).toMatch(/^label_[a-z0-9]+_[a-z0-9]+$/);
      expect(id2).toMatch(/^label_[a-z0-9]+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct format', () => {
      const id = generateLabelId();
      const parts = id.split('_');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('label');
      expect(parts[1]).toBeTruthy(); // timestamp part
      expect(parts[2]).toBeTruthy(); // random part
    });
  });
});