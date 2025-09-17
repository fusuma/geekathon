import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mockClient } from 'aws-sdk-client-mock';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { generateLabelWithAI, generateLabelWithRetry, BedrockError } from '../../utils/bedrock';
import { ProductData } from '@repo/shared';

// Mock the Bedrock client
const bedrockMock = mockClient(BedrockRuntimeClient);

describe('Bedrock Utils', () => {
  beforeEach(() => {
    bedrockMock.reset();
  });

  const mockProductData: ProductData = {
    name: 'Test Juice',
    ingredients: ['Water', 'Apple Juice', 'Natural Flavors'],
    nutrition: {
      energy: { per100g: { value: 45, unit: 'kcal' } }
    },
    allergens: ['None'],
    market: 'EU'
  };

  const mockBedrockResponse = {
    content: [{
      text: JSON.stringify({
        legalLabel: {
          ingredients: 'Water, Apple Juice, Natural Flavors (in descending order by weight)',
          allergens: 'Contains: None declared',
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
          short: 'Refreshing natural apple juice with authentic fruit taste'
        },
        warnings: [
          'Once opened, consume within 3 days and keep refrigerated'
        ],
        complianceNotes: [
          'EU Regulation 1169/2011 compliant for nutritional labeling',
          'Ingredients listed in descending order by weight as required'
        ]
      })
    }]
  };

  describe('generateLabelWithAI', () => {
    it('should generate label successfully', async () => {
      bedrockMock.on(InvokeModelCommand).resolves({
        body: Buffer.from(JSON.stringify(mockBedrockResponse))
      });

      const result = await generateLabelWithAI({ productData: mockProductData });

      expect(result).toHaveProperty('legalLabel');
      expect(result).toHaveProperty('marketing');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('complianceNotes');

      expect(result.legalLabel.ingredients).toContain('Water');
      expect(result.marketing.short).toBeTruthy();
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.complianceNotes)).toBe(true);
    });

    it('should include market-specific information in prompt', async () => {
      bedrockMock.on(InvokeModelCommand).resolves({
        body: Buffer.from(JSON.stringify(mockBedrockResponse))
      });

      const spanishProductData: ProductData = {
        ...mockProductData,
        market: 'ES'
      };

      await generateLabelWithAI({ productData: spanishProductData });

      const callArgs = bedrockMock.call(0).args[0];
      const requestBody = JSON.parse(callArgs.input.body as string);
      const promptContent = requestBody.messages[0].content;

      expect(promptContent).toContain('Spanish');
      expect(promptContent).toContain('ES');
    });

    it('should throw BedrockError when no response body', async () => {
      bedrockMock.on(InvokeModelCommand).resolves({});

      await expect(generateLabelWithAI({ productData: mockProductData }))
        .rejects.toThrow(BedrockError);
    });

    it('should throw BedrockError when invalid JSON response', async () => {
      bedrockMock.on(InvokeModelCommand).resolves({
        body: Buffer.from(JSON.stringify({
          content: [{ text: 'invalid json content' }]
        }))
      });

      await expect(generateLabelWithAI({ productData: mockProductData }))
        .rejects.toThrow(BedrockError);
    });

    it('should throw BedrockError when response fails validation', async () => {
      const invalidResponse = {
        content: [{
          text: JSON.stringify({
            // Missing required fields
            legalLabel: {
              ingredients: 'Water'
              // missing allergens and nutrition
            }
            // missing marketing, warnings, complianceNotes
          })
        }]
      };

      bedrockMock.on(InvokeModelCommand).resolves({
        body: Buffer.from(JSON.stringify(invalidResponse))
      });

      await expect(generateLabelWithAI({ productData: mockProductData }))
        .rejects.toThrow(BedrockError);
    });

    it('should throw BedrockError on Bedrock service error', async () => {
      bedrockMock.on(InvokeModelCommand).rejects(new Error('ServiceUnavailable'));

      await expect(generateLabelWithAI({ productData: mockProductData }))
        .rejects.toThrow(BedrockError);
    });
  });

  describe('generateLabelWithRetry', () => {
    it('should succeed on first attempt', async () => {
      bedrockMock.on(InvokeModelCommand).resolves({
        body: Buffer.from(JSON.stringify(mockBedrockResponse))
      });

      const result = await generateLabelWithRetry({ productData: mockProductData });

      expect(result).toHaveProperty('legalLabel');
      expect(bedrockMock.calls()).toHaveLength(1);
    });

    it('should retry on failure and succeed on second attempt', async () => {
      bedrockMock
        .on(InvokeModelCommand).rejectsOnce(new Error('ServiceUnavailable'))
        .on(InvokeModelCommand).resolves({
          body: Buffer.from(JSON.stringify(mockBedrockResponse))
        });

      const startTime = Date.now();
      const result = await generateLabelWithRetry({ productData: mockProductData });
      const duration = Date.now() - startTime;

      expect(result).toHaveProperty('legalLabel');
      expect(bedrockMock.calls()).toHaveLength(2);
      expect(duration).toBeGreaterThan(1000); // Should have waited for backoff
    });

    it('should throw BedrockError after max retries', async () => {
      bedrockMock.on(InvokeModelCommand).rejects(new Error('ServiceUnavailable'));

      await expect(generateLabelWithRetry({ productData: mockProductData }, 2))
        .rejects.toThrow(BedrockError);

      expect(bedrockMock.calls()).toHaveLength(2);
    });

    it('should use default retry count of 3', async () => {
      bedrockMock.on(InvokeModelCommand).rejects(new Error('ServiceUnavailable'));

      await expect(generateLabelWithRetry({ productData: mockProductData }))
        .rejects.toThrow(BedrockError);

      expect(bedrockMock.calls()).toHaveLength(3);
    });

    it('should implement exponential backoff', async () => {
      bedrockMock.on(InvokeModelCommand).rejects(new Error('ServiceUnavailable'));

      const startTime = Date.now();

      try {
        await generateLabelWithRetry({ productData: mockProductData }, 3);
      } catch (error) {
        // Expected to fail
      }

      const duration = Date.now() - startTime;

      // Should have waited approximately 1s + 2s = 3s total for backoffs
      expect(duration).toBeGreaterThan(3000);
      expect(duration).toBeLessThan(5000); // Allow some tolerance
    });
  });
});