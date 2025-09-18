// import { ProductData } from '@repo/shared';
type ProductData = any;
type Market = 'US' | 'UK' | 'ES' | 'AO' | 'MO' | 'BR' | 'AE';
type Language = 'en' | 'pt' | 'pt-BR' | 'es' | 'zh' | 'ar';
import { getMarketTemplate, MarketTemplate } from './market-config';

export interface PromptContext {
  productData: ProductData;
  marketTemplate: MarketTemplate;
}

export function buildMarketSpecificPrompt(productData: ProductData): string {
  const marketTemplate = getMarketTemplate(productData.market);
  const context: PromptContext = { productData, marketTemplate };

  return createPromptTemplate(context);
}

function createPromptTemplate(context: PromptContext): string {
  const { productData, marketTemplate } = context;
  const { name, ingredients, nutrition, allergens, market } = productData;

  const nutritionInfo = nutrition ? JSON.stringify(nutrition, null, 2) : 'Not provided';
  const allergenInfo = allergens?.join(', ') || 'Not specified';

  // Build market-specific requirements
  const requirementsList = marketTemplate.specificRequirements
    .map(req => `- ${req}`)
    .join('\n');

  const regulationsList = marketTemplate.regulations
    .map(reg => `- ${reg}`)
    .join('\n');

  const certificationsList = marketTemplate.certifications
    .map(cert => `- ${cert}`)
    .join('\n');

  const culturalList = marketTemplate.culturalConsiderations
    .map(consideration => `- ${consideration}`)
    .join('\n');

  // Language and translation context
  const languageInstructions = getLanguageInstructions(marketTemplate);
  const responseFormatAdjustments = getResponseFormatAdjustments(marketTemplate);

  return `You are an expert food labeling specialist for ${marketTemplate.marketName} market. Generate a compliant food label for the following product.

PRODUCT INFORMATION:
- Name: ${name}
- Ingredients: ${ingredients.join(', ')}
- Allergens: ${allergenInfo}
- Nutrition Data: ${nutritionInfo}
- Target Market: ${market} (${marketTemplate.marketName})

MARKET-SPECIFIC REGULATORY REQUIREMENTS:
${regulationsList}

CERTIFICATION STANDARDS TO CONSIDER:
${certificationsList}

CULTURAL & REGIONAL CONSIDERATIONS:
${culturalList}

SPECIFIC LABELING REQUIREMENTS:
${requirementsList}

${languageInstructions}

COMPLIANCE FOCUS AREAS:
- Ensure full compliance with local food safety regulations
- Include appropriate regional certifications where applicable
- Address cultural dietary preferences and restrictions
- Follow local language and naming conventions
- Include market-specific warnings and disclaimers

${responseFormatAdjustments}

Generate the label now:`;
}

function getLanguageInstructions(template: MarketTemplate): string {
  const { market, language, translations } = template;

  switch (market) {
    case 'AO':
      return `LANGUAGE REQUIREMENTS:
- All text must be in Portuguese (Angola variant)
- Use formal Portuguese terminology for food labeling
- Include tropical climate storage instructions
- Ensure compliance with Portuguese colonial legacy standards`;

    case 'MO':
      return `LANGUAGE REQUIREMENTS:
- Provide dual language support (Chinese characters and Portuguese)
- Respect both Chinese and Portuguese cultural naming conventions
- Include tourism industry appropriate language
- Format: "Portuguese / Chinese" for all labels`;

    case 'BR':
      return `LANGUAGE REQUIREMENTS:
- All text must be in Brazilian Portuguese
- Use ANVISA-approved terminology
- Include Brazilian-specific ingredient names
- Follow Brazilian consumer protection language standards`;

    case 'ES':
      return `LANGUAGE REQUIREMENTS:
- Provide Spanish language allergen warnings
- Use Spanish naming conventions for ingredients
- Include both Spanish and English where appropriate
- Follow EU standards with Spanish localization`;

    case 'UK':
    default:
      return `LANGUAGE REQUIREMENTS:
- Use clear, professional English
- Include standardized EU terminology
- Ensure international accessibility`;
  }
}

function getResponseFormatAdjustments(template: MarketTemplate): string {
  const baseFormat = `RESPONSE FORMAT (JSON only, no additional text):
{
  "legalLabel": {
    "ingredients": "Comma-separated ingredients in descending order by weight, following ${template.marketName} naming conventions",
    "allergens": "Clear allergen statement in ${template.language}",
    "nutrition": {
      "energy": {
        "per100g": {
          "value": 0,
          "unit": "kcal"
        }
      },
      "fat": {
        "per100g": {
          "value": 0,
          "unit": "g"
        }
      },
      "saturatedFat": {
        "per100g": {
          "value": 0,
          "unit": "g"
        }
      },
      "carbohydrates": {
        "per100g": {
          "value": 0,
          "unit": "g"
        }
      },
      "sugars": {
        "per100g": {
          "value": 0,
          "unit": "g"
        }
      },
      "protein": {
        "per100g": {
          "value": 0,
          "unit": "g"
        }
      },
      "salt": {
        "per100g": {
          "value": 0,
          "unit": "g"
        }
      }
    }
  },
  "marketing": {
    "short": "Compelling, compliant marketing description in ${template.language} (2-3 sentences max)"
  },
  "warnings": [
    "Array of any mandatory warnings based on ingredients/allergens in ${template.language}"
  ],
  "complianceNotes": [
    "Array of specific regulatory compliance notes for ${template.marketName} market"
  ]
}`;

  // Add market-specific format modifications
  if (template.translations) {
    return baseFormat + `

TRANSLATION NOTES:
- Allergen Warning Prefix: "${template.translations.allergenWarning}"
- Ingredients Label: "${template.translations.ingredientsLabel}"
- Nutrition Label: "${template.translations.nutritionLabel}"`;
  }

  return baseFormat;
}

export function validateMarketPrompt(market: string, prompt: string): boolean {
  const template = getMarketTemplate(market as any);
  if (!template) return false;

  // Basic validation checks
  const hasMarketName = prompt.includes(template.marketName);
  const hasLanguage = prompt.includes(template.language);
  const hasRegulations = template.regulations.some(reg => {
    const firstWord = reg.toLowerCase().split(' ')[0];
    return firstWord && prompt.toLowerCase().includes(firstWord);
  });

  return hasMarketName && hasLanguage && hasRegulations;
}