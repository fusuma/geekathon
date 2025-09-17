import { describe, it, expect } from '@jest/globals';
import {
  NutritionValueSchema,
  NutritionServingInfoSchema,
  NutritionFactSheetSchema,
  LegalLabelSchema,
  MarketingInfoSchema,
  LabelDataSchema,
  LabelSchema,
  ProductDataSchema
} from '../../src/schemas';

describe('Label Schemas', () => {
  describe('NutritionValueSchema', () => {
    it('should validate valid nutrition value', () => {
      const validData = {
        value: 250,
        unit: 'kcal'
      };

      expect(() => NutritionValueSchema.parse(validData)).not.toThrow();
      const result = NutritionValueSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid nutrition value', () => {
      const invalidData = {
        value: 'not-a-number',
        unit: 'kcal'
      };

      expect(() => NutritionValueSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing required fields', () => {
      const incompleteData = {
        value: 250
        // missing unit
      };

      expect(() => NutritionValueSchema.parse(incompleteData)).toThrow();
    });
  });

  describe('NutritionServingInfoSchema', () => {
    it('should validate complete serving info', () => {
      const validData = {
        per100g: { value: 250, unit: 'kcal' },
        perServing: { value: 125, unit: 'kcal' },
        percentDailyValue: 12
      };

      expect(() => NutritionServingInfoSchema.parse(validData)).not.toThrow();
    });

    it('should validate minimal serving info', () => {
      const validData = {
        per100g: { value: 250, unit: 'kcal' }
      };

      expect(() => NutritionServingInfoSchema.parse(validData)).not.toThrow();
    });

    it('should reject missing per100g', () => {
      const invalidData = {
        perServing: { value: 125, unit: 'kcal' }
      };

      expect(() => NutritionServingInfoSchema.parse(invalidData)).toThrow();
    });
  });

  describe('NutritionFactSheetSchema', () => {
    it('should validate complete nutrition facts', () => {
      const validData = {
        energy: {
          per100g: { value: 250, unit: 'kcal' }
        },
        fat: {
          per100g: { value: 15, unit: 'g' }
        },
        protein: {
          per100g: { value: 8, unit: 'g' }
        }
      };

      expect(() => NutritionFactSheetSchema.parse(validData)).not.toThrow();
    });

    it('should validate empty nutrition facts', () => {
      const validData = {};

      expect(() => NutritionFactSheetSchema.parse(validData)).not.toThrow();
    });

    it('should allow additional nutrition fields', () => {
      const validData = {
        energy: {
          per100g: { value: 250, unit: 'kcal' }
        },
        customField: {
          per100g: { value: 5, unit: 'mg' }
        }
      };

      expect(() => NutritionFactSheetSchema.parse(validData)).not.toThrow();
    });
  });

  describe('LabelDataSchema', () => {
    it('should validate complete label data', () => {
      const validData = {
        legalLabel: {
          ingredients: 'Water, Sugar, Natural Flavors',
          allergens: 'Contains: None',
          nutrition: {
            energy: {
              per100g: { value: 250, unit: 'kcal' }
            }
          }
        },
        marketing: {
          short: 'Refreshing natural beverage'
        },
        warnings: ['Keep refrigerated'],
        complianceNotes: ['EU Regulation 1169/2011 compliant']
      };

      expect(() => LabelDataSchema.parse(validData)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        legalLabel: {
          ingredients: 'Water, Sugar',
          // missing allergens and nutrition
        },
        marketing: {
          short: 'Great product'
        }
        // missing warnings and complianceNotes
      };

      expect(() => LabelDataSchema.parse(invalidData)).toThrow();
    });
  });

  describe('LabelSchema', () => {
    it('should validate complete label', () => {
      const validData = {
        labelId: 'label_123_abc',
        productId: 'product_456',
        labelData: {
          legalLabel: {
            ingredients: 'Water, Sugar, Natural Flavors',
            allergens: 'Contains: None',
            nutrition: {
              energy: { per100g: { value: 250, unit: 'kcal' } }
            }
          },
          marketing: {
            short: 'Refreshing natural beverage'
          },
          warnings: [],
          complianceNotes: ['EU compliant']
        },
        market: 'EU' as const,
        createdAt: '2023-09-17T10:00:00Z',
        generatedBy: 'ai-bedrock-claude'
      };

      expect(() => LabelSchema.parse(validData)).not.toThrow();
    });

    it('should validate label without productId', () => {
      const validData = {
        labelId: 'label_123_abc',
        labelData: {
          legalLabel: {
            ingredients: 'Water, Sugar',
            allergens: 'None',
            nutrition: {}
          },
          marketing: { short: 'Good product' },
          warnings: [],
          complianceNotes: []
        },
        market: 'ES' as const,
        createdAt: '2023-09-17T10:00:00Z',
        generatedBy: 'ai-bedrock-claude'
      };

      expect(() => LabelSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid market', () => {
      const invalidData = {
        labelId: 'label_123_abc',
        labelData: {
          legalLabel: {
            ingredients: 'Water',
            allergens: 'None',
            nutrition: {}
          },
          marketing: { short: 'Product' },
          warnings: [],
          complianceNotes: []
        },
        market: 'US', // Invalid market
        createdAt: '2023-09-17T10:00:00Z',
        generatedBy: 'ai-bedrock-claude'
      };

      expect(() => LabelSchema.parse(invalidData)).toThrow();
    });
  });

  describe('ProductDataSchema', () => {
    it('should validate complete product data', () => {
      const validData = {
        name: 'Natural Fruit Juice',
        ingredients: ['Water', 'Apple Juice', 'Natural Flavors'],
        nutrition: {
          energy: { per100g: { value: 45, unit: 'kcal' } },
          sugars: { per100g: { value: 10, unit: 'g' } }
        },
        allergens: ['None'],
        market: 'EU' as const,
        productId: 'prod_123'
      };

      expect(() => ProductDataSchema.parse(validData)).not.toThrow();
    });

    it('should validate minimal product data', () => {
      const validData = {
        name: 'Simple Product',
        ingredients: ['Water'],
        market: 'ES' as const
      };

      expect(() => ProductDataSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty ingredients array', () => {
      const invalidData = {
        name: 'Product',
        ingredients: [], // Empty array not allowed
        market: 'EU' as const
      };

      expect(() => ProductDataSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid market', () => {
      const invalidData = {
        name: 'Product',
        ingredients: ['Water'],
        market: 'INVALID'
      };

      expect(() => ProductDataSchema.parse(invalidData)).toThrow();
    });
  });
});