import { Market, Language, LabelData } from '@repo/shared';

export interface TranslationService {
  translateLabel(labelData: LabelData, targetLanguage: Language, market: Market): Promise<LabelData>;
  validateTranslation(original: LabelData, translated: LabelData, language: Language): boolean;
}

export interface PortugueseTranslationContext {
  market: Market;
  variant: 'brazilian' | 'angolan' | 'european';
  formalLevel: 'formal' | 'consumer-friendly';
}

export class PortugueseTranslationService implements TranslationService {
  private readonly commonIngredientTranslations = new Map<string, string>([
    // Common ingredients in Portuguese
    ['wheat flour', 'farinha de trigo'],
    ['sugar', 'açúcar'],
    ['vegetable oil', 'óleo vegetal'],
    ['salt', 'sal'],
    ['water', 'água'],
    ['milk', 'leite'],
    ['eggs', 'ovos'],
    ['butter', 'manteiga'],
    ['chocolate', 'chocolate'],
    ['vanilla', 'baunilha'],
    ['cocoa', 'cacau'],
    ['corn starch', 'amido de milho'],
    ['baking powder', 'fermento em pó'],
    ['citric acid', 'ácido cítrico'],
    ['preservatives', 'conservantes'],
    ['artificial flavors', 'aromas artificiais'],
    ['natural flavors', 'aromas naturais'],
    ['soy lecithin', 'lecitina de soja'],
    ['palm oil', 'óleo de palma'],
    ['sunflower oil', 'óleo de girassol']
  ]);

  private readonly commonAllergenTranslations = new Map<string, string>([
    ['contains', 'contém'],
    ['may contain', 'pode conter'],
    ['gluten', 'glúten'],
    ['nuts', 'nozes'],
    ['peanuts', 'amendoim'],
    ['soy', 'soja'],
    ['milk', 'leite'],
    ['eggs', 'ovos'],
    ['fish', 'peixe'],
    ['shellfish', 'crustáceos'],
    ['sesame', 'gergelim'],
    ['sulfites', 'sulfitos']
  ]);

  private readonly nutritionTermTranslations = new Map<string, string>([
    ['energy', 'energia'],
    ['calories', 'calorias'],
    ['fat', 'gorduras'],
    ['saturated fat', 'gorduras saturadas'],
    ['carbohydrates', 'carboidratos'],
    ['sugars', 'açúcares'],
    ['protein', 'proteínas'],
    ['salt', 'sal'],
    ['fiber', 'fibras'],
    ['sodium', 'sódio'],
    ['per 100g', 'por 100g'],
    ['per serving', 'por porção']
  ]);

  async translateLabel(labelData: LabelData, targetLanguage: Language, market: Market): Promise<LabelData> {
    // For Portuguese markets (AO, BR), provide Portuguese translation
    if (targetLanguage === 'pt' || targetLanguage === 'pt-BR') {
      const context = this.getTranslationContext(market, targetLanguage);
      return this.translateToPortuguese(labelData, context);
    }

    // For non-Portuguese languages, return original (this service focuses on Portuguese)
    return labelData;
  }

  private getTranslationContext(market: Market, language: Language): PortugueseTranslationContext {
    switch (market) {
      case 'BR':
        return {
          market,
          variant: 'brazilian',
          formalLevel: 'consumer-friendly'
        };
      case 'AO':
        return {
          market,
          variant: 'angolan',
          formalLevel: 'formal'
        };
      default:
        return {
          market,
          variant: 'european',
          formalLevel: 'formal'
        };
    }
  }

  private async translateToPortuguese(labelData: LabelData, context: PortugueseTranslationContext): Promise<LabelData> {
    const translated: LabelData = {
      legalLabel: {
        ingredients: this.translateIngredients(labelData.legalLabel.ingredients, context),
        allergens: this.translateAllergens(labelData.legalLabel.allergens, context),
        nutrition: labelData.legalLabel.nutrition // Nutrition values stay the same, only labels change
      },
      marketing: {
        short: this.translateMarketing(labelData.marketing.short, context)
      },
      warnings: labelData.warnings.map(warning => this.translateWarning(warning, context)),
      complianceNotes: labelData.complianceNotes.map(note => this.translateComplianceNote(note, context))
    };

    return translated;
  }

  private translateIngredients(ingredients: string, context: PortugueseTranslationContext): string {
    let translated = ingredients;

    // Apply common ingredient translations
    this.commonIngredientTranslations.forEach((portuguese, english) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translated = translated.replace(regex, portuguese);
    });

    // Apply market-specific adjustments
    if (context.variant === 'brazilian') {
      translated = this.applyBrazilianVariations(translated);
    }

    return translated;
  }

  private translateAllergens(allergens: string, context: PortugueseTranslationContext): string {
    let translated = allergens;

    // Apply common allergen translations
    this.commonAllergenTranslations.forEach((portuguese, english) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translated = translated.replace(regex, portuguese);
    });

    // Ensure proper Portuguese allergen format
    if (context.variant === 'brazilian') {
      // Brazilian format: "Contém: [allergens]"
      if (!translated.toLowerCase().includes('contém')) {
        translated = `Contém: ${translated}`;
      }
    } else {
      // Angolan/European format: "Contém [allergens]"
      if (!translated.toLowerCase().includes('contém')) {
        translated = `Contém ${translated}`;
      }
    }

    return translated;
  }

  private translateMarketing(marketing: string, context: PortugueseTranslationContext): string {
    // For now, provide basic translation framework
    // In a real implementation, this would use a more sophisticated translation service

    const basicTranslations = new Map<string, string>([
      ['delicious', 'delicioso'],
      ['natural', 'natural'],
      ['organic', 'orgânico'],
      ['fresh', 'fresco'],
      ['premium', 'premium'],
      ['healthy', 'saudável'],
      ['quality', 'qualidade'],
      ['traditional', 'tradicional']
    ]);

    let translated = marketing;
    basicTranslations.forEach((portuguese, english) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translated = translated.replace(regex, portuguese);
    });

    return translated;
  }

  private translateWarning(warning: string, context: PortugueseTranslationContext): string {
    const warningTranslations = new Map<string, string>([
      ['keep refrigerated', 'manter refrigerado'],
      ['store in a cool place', 'armazenar em local fresco'],
      ['consume before', 'consumir antes de'],
      ['not suitable for children', 'não adequado para crianças'],
      ['may cause allergic reactions', 'pode causar reações alérgicas']
    ]);

    let translated = warning;
    warningTranslations.forEach((portuguese, english) => {
      const regex = new RegExp(english, 'gi');
      translated = translated.replace(regex, portuguese);
    });

    return translated;
  }

  private translateComplianceNote(note: string, context: PortugueseTranslationContext): string {
    const complianceTranslations = new Map<string, string>([
      ['complies with', 'está em conformidade com'],
      ['meets standards', 'atende aos padrões'],
      ['certified by', 'certificado por'],
      ['approved by', 'aprovado por']
    ]);

    let translated = note;
    complianceTranslations.forEach((portuguese, english) => {
      const regex = new RegExp(english, 'gi');
      translated = translated.replace(regex, portuguese);
    });

    return translated;
  }

  private applyBrazilianVariations(text: string): string {
    // Apply Brazilian Portuguese specific variations
    const brazilianVariations = new Map<string, string>([
      ['óleo de girassol', 'óleo de girassol'],
      ['farinha de trigo', 'farinha de trigo especial'], // Brazilian tends to specify type
      ['conservantes', 'conservador'], // Brazilian regulatory term
    ]);

    let result = text;
    brazilianVariations.forEach((brazilian, standard) => {
      const regex = new RegExp(standard, 'gi');
      result = result.replace(regex, brazilian);
    });

    return result;
  }

  validateTranslation(original: LabelData, translated: LabelData, language: Language): boolean {
    // Basic validation checks
    const hasTranslatedIngredients = translated.legalLabel.ingredients !== original.legalLabel.ingredients;
    const hasTranslatedAllergens = translated.legalLabel.allergens !== original.legalLabel.allergens;
    const hasPortugueseContent = this.containsPortuguese(translated.legalLabel.allergens);

    return hasTranslatedIngredients && hasTranslatedAllergens && hasPortugueseContent;
  }

  private containsPortuguese(text: string): boolean {
    const portugueseWords = ['contém', 'açúcar', 'leite', 'ovos', 'glúten', 'pode', 'soja'];
    return portugueseWords.some(word => text.toLowerCase().includes(word));
  }
}

export const translationService = new PortugueseTranslationService();