import { PortugueseTranslationService } from '../../services/translation';
import { LabelData, Market, Language } from '@repo/shared';

describe('Portuguese Translation Service', () => {
  let translationService: PortugueseTranslationService;

  const mockLabelData: LabelData = {
    legalLabel: {
      ingredients: 'wheat flour, sugar, vegetable oil, salt, eggs, milk, chocolate',
      allergens: 'Contains gluten, eggs, milk, may contain nuts',
      nutrition: {
        energy: { per100g: { value: 450, unit: 'kcal' } },
        fat: { per100g: { value: 18, unit: 'g' } },
        carbohydrates: { per100g: { value: 65, unit: 'g' } },
        protein: { per100g: { value: 12, unit: 'g' } },
        salt: { per100g: { value: 1.2, unit: 'g' } }
      }
    },
    marketing: {
      short: 'Delicious organic healthy snack made with natural ingredients'
    },
    warnings: ['Keep refrigerated', 'Consume before expiry date'],
    complianceNotes: ['Complies with EU regulations', 'Certified by organic authority']
  };

  beforeEach(() => {
    translationService = new PortugueseTranslationService();
  });

  describe('Brazilian Portuguese Translation', () => {
    test('should translate label data to Brazilian Portuguese', async () => {
      const translated = await translationService.translateLabel(
        mockLabelData,
        'pt-BR',
        'BR'
      );

      expect(translated.legalLabel.ingredients).toContain('farinha de trigo');
      expect(translated.legalLabel.ingredients).toContain('açúcar');
      expect(translated.legalLabel.ingredients).toContain('óleo vegetal');
      expect(translated.legalLabel.allergens).toContain('contém');
      expect(translated.legalLabel.allergens).toContain('glúten');
      expect(translated.legalLabel.allergens).toContain('leite');
    });

    test('should apply Brazilian Portuguese variations', async () => {
      const translated = await translationService.translateLabel(
        mockLabelData,
        'pt-BR',
        'BR'
      );

      // Brazilian format should use specific regulatory terms
      expect(translated.legalLabel.allergens).toMatch(/contém/i);
    });
  });

  describe('Translation Validation', () => {
    test('should validate successful Portuguese translation', () => {
      const original = mockLabelData;
      const translated: LabelData = {
        ...mockLabelData,
        legalLabel: {
          ...mockLabelData.legalLabel,
          ingredients: 'farinha de trigo, açúcar, óleo vegetal',
          allergens: 'contém glúten, ovos, leite'
        }
      };

      const isValid = translationService.validateTranslation(original, translated, 'pt');
      expect(isValid).toBe(true);
    });

    test('should detect failed translation', () => {
      const original = mockLabelData;
      const notTranslated = mockLabelData; // Same as original

      const isValid = translationService.validateTranslation(original, notTranslated, 'pt');
      expect(isValid).toBe(false);
    });
  });
});