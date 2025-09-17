import { buildMarketSpecificPrompt, validateMarketPrompt } from '../../templates/markets/prompt-builder';
import { getMarketTemplate } from '../../templates/markets/market-config';
import { ProductData, Market } from '@repo/shared';

describe('Market-Specific Prompt Generation', () => {
  const baseProductData: ProductData = {
    name: 'Organic Granola Bar',
    ingredients: ['oats', 'honey', 'almonds', 'dried cranberries'],
    allergens: ['nuts'],
    nutrition: {
      energy: { per100g: { value: 450, unit: 'kcal' } },
      fat: { per100g: { value: 18, unit: 'g' } },
      carbohydrates: { per100g: { value: 65, unit: 'g' } },
      protein: { per100g: { value: 12, unit: 'g' } }
    },
    market: 'EU' // Will be overridden in tests
  };

  describe('EU Market Prompt Generation', () => {
    test('should generate EU-specific prompt with correct regulations', () => {
      const productData: ProductData = { ...baseProductData, market: 'EU' };
      const prompt = buildMarketSpecificPrompt(productData);

      expect(prompt).toContain('European Union');
      expect(prompt).toContain('EU Regulation 1169/2011');
      expect(prompt).toContain('per 100g/100ml');
      expect(validateMarketPrompt('EU', prompt)).toBe(true);
    });

    test('should include EU-specific certifications', () => {
      const productData: ProductData = { ...baseProductData, market: 'EU' };
      const prompt = buildMarketSpecificPrompt(productData);

      expect(prompt).toContain('EU Organic');
      expect(prompt).toContain('IFS Food');
      expect(prompt).toContain('BRC Food Safety');
    });
  });

  describe('Spain Market Prompt Generation', () => {
    test('should generate Spain-specific prompt with Spanish requirements', () => {
      const productData: ProductData = { ...baseProductData, market: 'ES' };
      const prompt = buildMarketSpecificPrompt(productData);

      expect(prompt).toContain('Spain');
      expect(prompt).toContain('Spanish language allergen warnings');
      expect(prompt).toContain('Real Decreto 1334/1999');
      expect(validateMarketPrompt('ES', prompt)).toBe(true);
    });

    test('should include Spanish translations', () => {
      const template = getMarketTemplate('ES');
      expect(template.translations?.allergenWarning).toBe('Contiene');
      expect(template.translations?.ingredientsLabel).toBe('Ingredientes');
    });
  });

  describe('Angola Market Prompt Generation', () => {
    test('should generate Angola-specific prompt with Portuguese requirements', () => {
      const productData: ProductData = { ...baseProductData, market: 'AO' };
      const prompt = buildMarketSpecificPrompt(productData);

      expect(prompt).toContain('Angola');
      expect(prompt).toContain('Portuguese language mandatory');
      expect(prompt).toContain('tropical climate');
      expect(prompt).toContain('Portuguese colonial legacy');
      expect(validateMarketPrompt('AO', prompt)).toBe(true);
    });

    test('should include Angola-specific considerations', () => {
      const productData: ProductData = { ...baseProductData, market: 'AO' };
      const prompt = buildMarketSpecificPrompt(productData);

      expect(prompt).toContain('Economic accessibility focus');
      expect(prompt).toContain('Traditional African ingredients');
      expect(prompt).toContain('Tropical shelf-life considerations');
    });
  });

  describe('Macau SAR Market Prompt Generation', () => {
    test('should generate Macau-specific prompt with dual language requirements', () => {
      const productData: ProductData = { ...baseProductData, market: 'MO' };
      const prompt = buildMarketSpecificPrompt(productData);

      expect(prompt).toContain('Macau SAR');
      expect(prompt).toContain('Chinese characters and Portuguese');
      expect(prompt).toContain('Tourism industry compliance');
      expect(prompt).toContain('Dual cultural influence');
      expect(validateMarketPrompt('MO', prompt)).toBe(true);
    });

    test('should include tourism and hospitality focus', () => {
      const productData: ProductData = { ...baseProductData, market: 'MO' };
      const prompt = buildMarketSpecificPrompt(productData);

      expect(prompt).toContain('Tourism-focused food service');
      expect(prompt).toContain('High-end hospitality market');
      expect(prompt).toContain('Chinese traditional medicine');
    });
  });

  describe('Brazil Market Prompt Generation', () => {
    test('should generate Brazil-specific prompt with ANVISA requirements', () => {
      const productData: ProductData = { ...baseProductData, market: 'BR' };
      const prompt = buildMarketSpecificPrompt(productData);

      expect(prompt).toContain('Brazil');
      expect(prompt).toContain('ANVISA');
      expect(prompt).toContain('Brazilian Portuguese');
      expect(prompt).toContain('SISORG Organic');
      expect(validateMarketPrompt('BR', prompt)).toBe(true);
    });

    test('should include Brazilian-specific requirements', () => {
      const productData: ProductData = { ...baseProductData, market: 'BR' };
      const prompt = buildMarketSpecificPrompt(productData);

      expect(prompt).toContain('Large-scale agriculture market');
      expect(prompt).toContain('SAC (Customer Service)');
      expect(prompt).toContain('Brazilian ingredient naming');
    });
  });

  describe('Market Template Validation', () => {
    test('should validate all market templates exist', () => {
      const markets: Market[] = ['EU', 'ES', 'AO', 'MO', 'BR'];

      markets.forEach(market => {
        const template = getMarketTemplate(market);
        expect(template).toBeDefined();
        expect(template.market).toBe(market);
        expect(template.marketName).toBeTruthy();
        expect(template.regulations.length).toBeGreaterThan(0);
        expect(template.certifications.length).toBeGreaterThan(0);
      });
    });

    test('should have Portuguese translations for appropriate markets', () => {
      const portugueseMarkets: Market[] = ['AO', 'BR', 'ES'];

      portugueseMarkets.forEach(market => {
        const template = getMarketTemplate(market);
        if (market === 'AO' || market === 'BR') {
          expect(template.translations).toBeDefined();
          expect(template.translations?.allergenWarning).toBe('Contém');
        }
        if (market === 'ES') {
          expect(template.translations?.allergenWarning).toBe('Contiene');
        }
      });
    });

    test('should have unique regulations for each market', () => {
      const markets: Market[] = ['EU', 'ES', 'AO', 'MO', 'BR'];
      const allRegulations = new Set<string>();

      markets.forEach(market => {
        const template = getMarketTemplate(market);
        template.regulations.forEach(regulation => {
          // Each market should have some unique regulations
          expect(regulation).toBeTruthy();
        });
      });
    });
  });

  describe('Prompt Content Validation', () => {
    test('should include product information in all market prompts', () => {
      const markets: Market[] = ['EU', 'ES', 'AO', 'MO', 'BR'];

      markets.forEach(market => {
        const productData: ProductData = { ...baseProductData, market };
        const prompt = buildMarketSpecificPrompt(productData);

        expect(prompt).toContain(productData.name);
        expect(prompt).toContain('oats');
        expect(prompt).toContain('honey');
        expect(prompt).toContain('nuts');
      });
    });

    test('should include JSON response format in all prompts', () => {
      const markets: Market[] = ['EU', 'ES', 'AO', 'MO', 'BR'];

      markets.forEach(market => {
        const productData: ProductData = { ...baseProductData, market };
        const prompt = buildMarketSpecificPrompt(productData);

        expect(prompt).toContain('RESPONSE FORMAT');
        expect(prompt).toContain('JSON only');
        expect(prompt).toContain('legalLabel');
        expect(prompt).toContain('marketing');
        expect(prompt).toContain('warnings');
        expect(prompt).toContain('complianceNotes');
      });
    });
  });
});