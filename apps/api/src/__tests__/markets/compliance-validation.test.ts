import {
  validateAngolaCompliance,
  validateMacauCompliance,
  validateBrazilCompliance,
  getMarketComplianceSummary,
  formatMarketAllergens,
  ANGOLA_SPECIFIC_REQUIREMENTS,
  MACAU_SPECIFIC_REQUIREMENTS,
  BRAZIL_SPECIFIC_REQUIREMENTS
} from '../../utils/compliance';

describe('Market-Specific Compliance Validation', () => {
  const mockLabelData = {
    legalLabel: {
      ingredients: 'Test ingredients',
      allergens: 'Contains: milk',
      nutrition: { energy: { per100g: '100 kcal' }, fat: { per100g: '1g' } }
    },
    marketing: { short: 'Test product' },
    complianceNotes: ['Test compliance'],
    warnings: []
  };

  const mockProductData = {
    name: 'Test Product',
    market: 'US',
    ingredients: ['ingredient1', 'ingredient2'],
    allergens: ['milk'],
    nutrition: { energy: 100, fat: 1 }
  };

  describe('Angola Compliance Validation', () => {
    test('Should pass validation for Portuguese language content', () => {
      const angolaLabelData = {
        ...mockLabelData,
        legalLabel: {
          ...mockLabelData.legalLabel,
          allergens: 'Contém: leite',
          ingredients: 'ingredientes de teste'
        }
      };

      const result = validateAngolaCompliance(angolaLabelData, { ...mockProductData, market: 'AO' });

      expect(result.isCompliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test('Should fail validation for missing Portuguese language', () => {
      const result = validateAngolaCompliance(mockLabelData, { ...mockProductData, market: 'AO' });

      expect(result.isCompliant).toBe(false);
      expect(result.violations).toContain('Portuguese language required for Angola market');
    });

    test('Should warn about missing tropical climate considerations', () => {
      const angolaLabelData = {
        ...mockLabelData,
        legalLabel: {
          ...mockLabelData.legalLabel,
          allergens: 'Contém: leite',
          ingredients: 'ingredientes de teste'
        }
      };

      const result = validateAngolaCompliance(angolaLabelData, { ...mockProductData, market: 'AO' });

      expect(result.warnings).toContain('Consider adding tropical climate storage requirements');
    });

    test('Should validate Angola-specific requirements structure', () => {
      expect(ANGOLA_SPECIFIC_REQUIREMENTS.LANGUAGE).toBe('Portuguese language mandatory for all labeling');
      expect(ANGOLA_SPECIFIC_REQUIREMENTS.ALLERGEN_LABELING.language).toBe('Allergen warnings must be in Portuguese: "Contém:"');
      expect(ANGOLA_SPECIFIC_REQUIREMENTS.CLIMATE_CONSIDERATIONS.specifics).toContain('Humidity resistance');
    });
  });

  describe('Macau Compliance Validation', () => {
    test('Should pass validation for dual language content', () => {
      const macauLabelData = {
        ...mockLabelData,
        legalLabel: {
          ...mockLabelData.legalLabel,
          allergens: 'Contém/含有: leite/牛奶'
        }
      };

      const result = validateMacauCompliance(macauLabelData, { ...mockProductData, market: 'MO' });

      expect(result.isCompliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test('Should fail validation for missing dual language requirement', () => {
      const result = validateMacauCompliance(mockLabelData, { ...mockProductData, market: 'MO' });

      expect(result.isCompliant).toBe(false);
      expect(result.violations).toContain('Dual language labeling (Chinese and Portuguese) required for Macau market');
    });

    test('Should recommend tourism industry compliance', () => {
      const macauLabelData = {
        ...mockLabelData,
        legalLabel: {
          ...mockLabelData.legalLabel,
          allergens: 'Contém/含有: leite'
        }
      };

      const result = validateMacauCompliance(macauLabelData, { ...mockProductData, market: 'MO' });

      expect(result.recommendations).toContain('Consider adding tourism industry compliance notes');
    });

    test('Should validate Macau-specific requirements structure', () => {
      expect(MACAU_SPECIFIC_REQUIREMENTS.LANGUAGE).toBe('Dual language labeling (Chinese characters and Portuguese) required');
      expect(MACAU_SPECIFIC_REQUIREMENTS.ALLERGEN_LABELING.language).toBe('Format: "Contém/含有:"');
      expect(MACAU_SPECIFIC_REQUIREMENTS.TOURISM_INDUSTRY.specifics).toContain('High-end hospitality standards');
    });
  });

  describe('Brazil Compliance Validation', () => {
    test('Should pass validation for Brazilian Portuguese and ANVISA compliance', () => {
      const brazilLabelData = {
        ...mockLabelData,
        legalLabel: {
          ...mockLabelData.legalLabel,
          allergens: 'Contém: leite',
          ingredients: 'ingredientes de teste'
        },
        complianceNotes: ['ANVISA compliance requirements met', 'SAC contact: 0800-123-4567']
      };

      const result = validateBrazilCompliance(brazilLabelData, { ...mockProductData, market: 'BR' });

      expect(result.isCompliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test('Should fail validation for missing Brazilian Portuguese', () => {
      const result = validateBrazilCompliance(mockLabelData, { ...mockProductData, market: 'BR' });

      expect(result.isCompliant).toBe(false);
      expect(result.violations).toContain('Brazilian Portuguese language required for Brazil market');
    });

    test('Should fail validation for missing ANVISA compliance', () => {
      const brazilLabelData = {
        ...mockLabelData,
        legalLabel: {
          ...mockLabelData.legalLabel,
          allergens: 'Contém: leite',
          ingredients: 'ingredientes de teste'
        }
      };

      const result = validateBrazilCompliance(brazilLabelData, { ...mockProductData, market: 'BR' });

      expect(result.isCompliant).toBe(false);
      expect(result.violations).toContain('ANVISA compliance requirements not addressed');
    });

    test('Should warn about missing SAC information', () => {
      const brazilLabelData = {
        ...mockLabelData,
        legalLabel: {
          ...mockLabelData.legalLabel,
          allergens: 'Contém: leite',
          ingredients: 'ingredientes de teste'
        },
        complianceNotes: ['ANVISA compliance requirements met']
      };

      const result = validateBrazilCompliance(brazilLabelData, { ...mockProductData, market: 'BR' });

      expect(result.warnings).toContain('SAC (Customer Service) contact information should be included');
    });

    test('Should validate Brazil-specific requirements structure', () => {
      expect(BRAZIL_SPECIFIC_REQUIREMENTS.LANGUAGE).toBe('Brazilian Portuguese language mandatory');
      expect(BRAZIL_SPECIFIC_REQUIREMENTS.ANVISA_REQUIREMENTS.authority).toBe('Brazilian Health Regulatory Agency (ANVISA)');
      expect(BRAZIL_SPECIFIC_REQUIREMENTS.CUSTOMER_SERVICE.requirement).toBe('SAC (Customer Service) contact information mandatory');
    });
  });

  describe('Market Compliance Summary', () => {
    test('Should return market-specific compliance results', () => {
      const results = getMarketComplianceSummary(mockLabelData, { ...mockProductData, market: 'ES' });

      expect(results.eu).toBeDefined();
      expect(results.spain).toBeDefined();
    });

    test('Should return Angola-specific compliance for AO market', () => {
      const results = getMarketComplianceSummary(mockLabelData, { ...mockProductData, market: 'AO' });

      expect(results.eu).toBeDefined();
      expect(results.angola).toBeDefined();
      expect(results.angola.isCompliant).toBe(false); // Should fail due to missing Portuguese
    });

    test('Should return Macau-specific compliance for MO market', () => {
      const results = getMarketComplianceSummary(mockLabelData, { ...mockProductData, market: 'MO' });

      expect(results.eu).toBeDefined();
      expect(results.macau).toBeDefined();
      expect(results.macau.isCompliant).toBe(false); // Should fail due to missing dual language
    });

    test('Should return Brazil-specific compliance for BR market', () => {
      const results = getMarketComplianceSummary(mockLabelData, { ...mockProductData, market: 'BR' });

      expect(results.eu).toBeDefined();
      expect(results.brazil).toBeDefined();
      expect(results.brazil.isCompliant).toBe(false); // Should fail due to missing Portuguese and ANVISA
    });
  });

  describe('Market Allergen Formatting', () => {
    const allergens = ['milk', 'eggs', 'nuts'];

    test('Should format allergens for Spanish market', () => {
      const result = formatMarketAllergens('ES', allergens);
      expect(result).toBe('Contiene: milk, eggs, nuts');
    });

    test('Should format allergens for Angola market', () => {
      const result = formatMarketAllergens('AO', allergens);
      expect(result).toBe('Contém: milk, eggs, nuts');
    });

    test('Should format allergens for Macau market', () => {
      const result = formatMarketAllergens('MO', allergens);
      expect(result).toBe('Contém/含有: milk, eggs, nuts');
    });

    test('Should format allergens for Brazil market', () => {
      const result = formatMarketAllergens('BR', allergens);
      expect(result).toBe('Contém: milk, eggs, nuts');
    });

    test('Should format allergens for default market', () => {
      const result = formatMarketAllergens('US', allergens);
      expect(result).toBe('Contains: milk, eggs, nuts');
    });

    test('Should return empty string for no allergens', () => {
      const result = formatMarketAllergens('ES', []);
      expect(result).toBe('');
    });
  });

  describe('Regulatory Constants Validation', () => {
    test('Should have proper structure for Angola requirements', () => {
      expect(ANGOLA_SPECIFIC_REQUIREMENTS).toHaveProperty('LANGUAGE');
      expect(ANGOLA_SPECIFIC_REQUIREMENTS).toHaveProperty('ALLERGEN_LABELING');
      expect(ANGOLA_SPECIFIC_REQUIREMENTS).toHaveProperty('CLIMATE_CONSIDERATIONS');
      expect(ANGOLA_SPECIFIC_REQUIREMENTS).toHaveProperty('CULTURAL_CONSIDERATIONS');
    });

    test('Should have proper structure for Macau requirements', () => {
      expect(MACAU_SPECIFIC_REQUIREMENTS).toHaveProperty('LANGUAGE');
      expect(MACAU_SPECIFIC_REQUIREMENTS).toHaveProperty('ALLERGEN_LABELING');
      expect(MACAU_SPECIFIC_REQUIREMENTS).toHaveProperty('TOURISM_INDUSTRY');
      expect(MACAU_SPECIFIC_REQUIREMENTS).toHaveProperty('SAR_REGULATIONS');
    });

    test('Should have proper structure for Brazil requirements', () => {
      expect(BRAZIL_SPECIFIC_REQUIREMENTS).toHaveProperty('LANGUAGE');
      expect(BRAZIL_SPECIFIC_REQUIREMENTS).toHaveProperty('ALLERGEN_LABELING');
      expect(BRAZIL_SPECIFIC_REQUIREMENTS).toHaveProperty('ANVISA_REQUIREMENTS');
      expect(BRAZIL_SPECIFIC_REQUIREMENTS).toHaveProperty('CUSTOMER_SERVICE');
      expect(BRAZIL_SPECIFIC_REQUIREMENTS).toHaveProperty('ORGANIC_CERTIFICATION');
    });
  });
});