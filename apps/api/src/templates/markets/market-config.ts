import { Market, MarketSpecificData } from '@repo/shared';

export interface MarketTemplate {
  market: Market;
  marketName: string;
  language: string;
  regulations: string[];
  certifications: string[];
  culturalConsiderations: string[];
  specificRequirements: string[];
  translations?: {
    allergenWarning: string;
    ingredientsLabel: string;
    nutritionLabel: string;
  };
}

export const marketTemplates: Record<Market, MarketTemplate> = {
  EU: {
    market: 'EU',
    marketName: 'European Union',
    language: 'English',
    regulations: [
      'EU Regulation 1169/2011 for nutritional information',
      'EU Regulation 178/2002 for food safety',
      'EU allergen regulations'
    ],
    certifications: ['EU Organic', 'IFS Food', 'BRC Food Safety'],
    culturalConsiderations: ['Multi-cultural market', 'Diverse dietary preferences'],
    specificRequirements: [
      'Ingredients in descending order by weight',
      'Nutritional information per 100g/100ml',
      'Clear allergen declarations',
      'Energy values in both kJ and kcal'
    ]
  },
  ES: {
    market: 'ES',
    marketName: 'Spain',
    language: 'Spanish/English',
    regulations: [
      'EU Regulation 1169/2011 for nutritional information',
      'Spanish food labeling requirements',
      'Real Decreto 1334/1999 for food labeling'
    ],
    certifications: ['EU Organic', 'IFS Food', 'Spanish Quality Mark'],
    culturalConsiderations: ['Mediterranean diet preferences', 'Traditional food culture'],
    specificRequirements: [
      'Spanish language allergen warnings',
      'Ingredients in descending order by weight',
      'Spanish specific naming conventions',
      'Regional certification preferences'
    ],
    translations: {
      allergenWarning: 'Contiene',
      ingredientsLabel: 'Ingredientes',
      nutritionLabel: 'Información nutricional'
    }
  },
  AO: {
    market: 'AO',
    marketName: 'Angola',
    language: 'Portuguese',
    regulations: [
      'Angolan Ministry of Health food regulations',
      'Portuguese colonial legacy standards',
      'Tropical climate storage requirements'
    ],
    certifications: ['Angola Quality Mark', 'Portuguese heritage certifications'],
    culturalConsiderations: [
      'Portuguese language requirements',
      'Tropical climate considerations',
      'Traditional African ingredients acceptance',
      'Economic accessibility focus'
    ],
    specificRequirements: [
      'Portuguese language mandatory',
      'Tropical shelf-life considerations',
      'Local ingredient naming conventions',
      'Import regulation compliance',
      'Vitamin D and preservation requirements for tropical climate'
    ],
    translations: {
      allergenWarning: 'Contém',
      ingredientsLabel: 'Ingredientes',
      nutritionLabel: 'Informação nutricional'
    }
  },
  MO: {
    market: 'MO',
    marketName: 'Macau SAR',
    language: 'Chinese/Portuguese',
    regulations: [
      'Macau SAR food safety regulations',
      'Chinese food safety standards (GB standards)',
      'Portuguese heritage food regulations',
      'Tourism industry food service standards'
    ],
    certifications: ['Macau Quality Mark', 'Chinese food safety certification', 'Portuguese heritage standards'],
    culturalConsiderations: [
      'Dual cultural influence (Chinese/Portuguese)',
      'Tourism-focused food service',
      'Gambling industry hospitality requirements',
      'Fusion cuisine acceptance'
    ],
    specificRequirements: [
      'Dual language labeling (Chinese characters and Portuguese)',
      'Tourism industry compliance',
      'Special Administrative Region regulations',
      'Chinese traditional medicine ingredient considerations',
      'High-end hospitality market standards'
    ],
    translations: {
      allergenWarning: 'Contém / 含有',
      ingredientsLabel: 'Ingredientes / 成分',
      nutritionLabel: 'Informação nutricional / 營養信息'
    }
  },
  BR: {
    market: 'BR',
    marketName: 'Brazil',
    language: 'Portuguese (Brazilian)',
    regulations: [
      'ANVISA food regulations (RDC)',
      'Brazilian Ministry of Health standards',
      'INMETRO labeling requirements',
      'Organic certification SISORG requirements'
    ],
    certifications: ['ANVISA certification', 'SISORG Organic', 'BRC Food Safety', 'IFS Food'],
    culturalConsiderations: [
      'Large-scale agriculture market',
      'Organic and natural product preference',
      'Regional dietary variations',
      'Economic accessibility important'
    ],
    specificRequirements: [
      'Brazilian Portuguese language mandatory',
      'ANVISA nutritional table format',
      'Detailed allergen information in Portuguese',
      'Organic certification prominence if applicable',
      'Brazilian ingredient naming conventions',
      'SAC (Customer Service) contact information'
    ],
    translations: {
      allergenWarning: 'Contém',
      ingredientsLabel: 'Ingredientes',
      nutritionLabel: 'Informação nutricional'
    }
  }
};

export function getMarketTemplate(market: Market): MarketTemplate {
  return marketTemplates[market];
}

export function createMarketSpecificData(market: Market): MarketSpecificData {
  const template = getMarketTemplate(market);
  return {
    certifications: template.certifications,
    localRegulations: template.regulations,
    culturalConsiderations: template.culturalConsiderations,
    languageVariant: template.language
  };
}