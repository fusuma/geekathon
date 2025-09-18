// import { LabelData, ProductData } from '@repo/shared';
type LabelData = any;
type ProductData = any;

export interface ComplianceValidationResult {
  isCompliant: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
}

// EU Regulation 1169/2011 - Food Information to Consumers (FIC)
export const EU_LABELING_REQUIREMENTS = {
  // Article 9 - Mandatory particulars
  MANDATORY_PARTICULARS: [
    'name of the food',
    'list of ingredients',
    'allergens',
    'quantity of certain ingredients or categories of ingredients',
    'net quantity of the food',
    'date of minimum durability or use by date',
    'special storage conditions and/or conditions of use',
    'name or business name and address of the food business operator',
    'country of origin or place of provenance',
    'instructions for use',
    'alcoholic strength',
    'nutrition declaration'
  ],

  // Article 21 - List of ingredients
  INGREDIENT_RULES: {
    descendingOrder: 'Ingredients must be listed in descending order of weight',
    categories: 'Ingredients may be designated by their category name',
    compounds: 'Compound ingredients must be broken down if they constitute more than 2% of the finished product'
  },

  // Annex II - Substances or products causing allergies or intolerances
  ALLERGENS: [
    'Cereals containing gluten',
    'Crustaceans',
    'Eggs',
    'Fish',
    'Peanuts',
    'Soybeans',
    'Milk',
    'Nuts',
    'Celery',
    'Mustard',
    'Sesame seeds',
    'Sulphur dioxide and sulphites',
    'Lupin',
    'Molluscs'
  ],

  // Article 30 - Nutrition declaration
  NUTRITION_DECLARATION: {
    mandatory: ['energy', 'fat', 'saturatedFat', 'carbohydrates', 'sugars', 'protein', 'salt'],
    optional: ['monounsaturatedFat', 'polyunsaturatedFat', 'polyols', 'starch', 'fiber', 'vitamins', 'minerals'],
    units: {
      energy: 'kJ and kcal',
      nutrients: 'g, mg, or μg'
    },
    reference: 'per 100g or 100ml'
  }
};

// Spain-specific requirements
export const SPAIN_SPECIFIC_REQUIREMENTS = {
  LANGUAGE: 'Spanish language required for consumer information',

  ALLERGEN_LABELING: {
    requirement: 'Allergens must be highlighted in ingredient list',
    language: 'Allergen warnings should be in Spanish for Spanish market'
  },

  NUTRITIONAL_CLAIMS: {
    authority: 'Spanish Agency for Consumer Affairs, Food Safety and Nutrition (AECOSAN)',
    regulations: 'Must comply with Spanish interpretation of EU regulations'
  },

  ORIGIN_LABELING: {
    requirement: 'Country of origin mandatory for certain products',
    specificProducts: ['meat', 'poultry', 'fish', 'eggs', 'dairy']
  }
};

export function validateEUCompliance(
  labelData: LabelData,
  productData: ProductData
): ComplianceValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check mandatory nutrition information
  const nutrition = labelData.legalLabel.nutrition;
  const requiredNutrients = EU_LABELING_REQUIREMENTS.NUTRITION_DECLARATION.mandatory;

  for (const nutrient of requiredNutrients) {
    if (!nutrition[nutrient]?.per100g) {
      violations.push(`Missing mandatory nutrition declaration for ${nutrient} per 100g`);
    }
  }

  // Check allergen declaration
  if (!labelData.legalLabel.allergens || labelData.legalLabel.allergens.length === 0) {
    warnings.push('No allergen information provided - ensure this is correct');
  }

  // Check ingredients list
  if (!labelData.legalLabel.ingredients || labelData.legalLabel.ingredients.length === 0) {
    violations.push('Ingredients list is mandatory and cannot be empty');
  }

  // Spain-specific checks
  if (productData.market === 'ES') {
    // Check if allergens might need Spanish translation
    if (labelData.legalLabel.allergens && /^[A-Z]/.test(labelData.legalLabel.allergens)) {
      recommendations.push('Consider providing allergen warnings in Spanish for Spanish market');
    }

    // Check for Spanish language compliance
    if (!labelData.legalLabel.ingredients.includes('contiene') &&
        !labelData.legalLabel.ingredients.includes('ingredientes')) {
      recommendations.push('Consider using Spanish terminology for Spanish market compliance');
    }
  }

  // General recommendations
  if (labelData.complianceNotes.length === 0) {
    warnings.push('No compliance notes provided - consider adding regulatory guidance');
  }

  if (labelData.warnings.length === 0 && productData.allergens && productData.allergens.length > 0) {
    warnings.push('Product has allergens but no warnings provided');
  }

  const isCompliant = violations.length === 0;

  return {
    isCompliant,
    violations,
    warnings,
    recommendations
  };
}

export function validateSpainCompliance(
  labelData: LabelData,
  productData: ProductData
): ComplianceValidationResult {
  const result = validateEUCompliance(labelData, productData);

  // Additional Spain-specific validations
  if (productData.market === 'ES') {
    // Check for Spanish language elements
    const hasSpanishContent =
      labelData.legalLabel.allergens.includes('Contiene') ||
      labelData.legalLabel.ingredients.includes('ingredientes') ||
      labelData.marketing.short.match(/[ñáéíóúü]/);

    if (!hasSpanishContent) {
      result.warnings.push('Consider including Spanish language content for Spanish market');
    }

    // Check for Spanish regulatory compliance notes
    const hasSpanishComplianceNotes = labelData.complianceNotes.some((note: any) =>
      note.toLowerCase().includes('spain') ||
      note.toLowerCase().includes('spanish') ||
      note.toLowerCase().includes('aecosan')
    );

    if (!hasSpanishComplianceNotes) {
      result.recommendations.push('Consider adding Spain-specific compliance notes');
    }
  }

  return result;
}

// Helper function to get compliance summary
export function getComplianceSummary(
  labelData: LabelData,
  productData: ProductData
): { eu: ComplianceValidationResult; spain?: ComplianceValidationResult } {
  const eu = validateEUCompliance(labelData, productData);
  const spain = productData.market === 'ES' ? validateSpainCompliance(labelData, productData) : undefined;

  return { eu, spain };
}

// Angola compliance rules (Portuguese colony regulations)
export const ANGOLA_SPECIFIC_REQUIREMENTS = {
  LANGUAGE: 'Portuguese language mandatory for all labeling',

  ALLERGEN_LABELING: {
    requirement: 'Allergens must be highlighted in ingredient list in Portuguese',
    language: 'Allergen warnings must be in Portuguese: "Contém:"'
  },

  CLIMATE_CONSIDERATIONS: {
    requirement: 'Tropical climate storage requirements mandatory',
    specifics: ['Humidity resistance', 'Temperature stability', 'Extended shelf-life considerations']
  },

  CULTURAL_CONSIDERATIONS: [
    'Portuguese language requirements',
    'Traditional African ingredients acceptance',
    'Economic accessibility focus',
    'Import regulation compliance'
  ]
};

// Macau compliance rules (Chinese SAR + Portuguese influence)
export const MACAU_SPECIFIC_REQUIREMENTS = {
  LANGUAGE: 'Dual language labeling (Chinese characters and Portuguese) required',

  ALLERGEN_LABELING: {
    requirement: 'Allergens must be in both Chinese and Portuguese',
    language: 'Format: "Contém/含有:"'
  },

  TOURISM_INDUSTRY: {
    requirement: 'Tourism industry food service standards compliance',
    specifics: ['High-end hospitality standards', 'Gambling industry requirements', 'Fusion cuisine acceptance']
  },

  SAR_REGULATIONS: {
    authority: 'Macau Special Administrative Region regulations',
    specifics: ['Chinese traditional medicine ingredient considerations', 'Dual cultural influence compliance']
  }
};

// Brazil compliance rules (ANVISA food regulations)
export const BRAZIL_SPECIFIC_REQUIREMENTS = {
  LANGUAGE: 'Brazilian Portuguese language mandatory',

  ALLERGEN_LABELING: {
    requirement: 'Detailed allergen information in Portuguese mandatory',
    language: 'Allergen warnings must be in Brazilian Portuguese: "Contém:"'
  },

  ANVISA_REQUIREMENTS: {
    authority: 'Brazilian Health Regulatory Agency (ANVISA)',
    nutritionalTable: 'ANVISA nutritional table format required',
    certification: 'ANVISA certification mandatory'
  },

  CUSTOMER_SERVICE: {
    requirement: 'SAC (Customer Service) contact information mandatory',
    format: 'Must include phone number and business hours'
  },

  ORGANIC_CERTIFICATION: {
    authority: 'SISORG (Brazilian Organic System)',
    requirement: 'Organic certification prominence if applicable'
  }
};

export function validateAngolaCompliance(
  labelData: LabelData,
  productData: ProductData
): ComplianceValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check Portuguese language requirement
  const hasPortugueseContent =
    labelData.legalLabel.allergens.includes('Contém') ||
    labelData.legalLabel.ingredients.includes('ingredientes');

  if (!hasPortugueseContent) {
    violations.push('Portuguese language required for Angola market');
  }

  // Check tropical climate considerations
  if (!labelData.complianceNotes.some((note: any) =>
    note.toLowerCase().includes('tropical') ||
    note.toLowerCase().includes('climate'))) {
    warnings.push('Consider adding tropical climate storage requirements');
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    warnings,
    recommendations
  };
}

export function validateMacauCompliance(
  labelData: LabelData,
  productData: ProductData
): ComplianceValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check dual language requirement
  const hasDualLanguage =
    labelData.legalLabel.allergens.includes('含有') ||
    labelData.legalLabel.allergens.includes('Contém');

  if (!hasDualLanguage) {
    violations.push('Dual language labeling (Chinese and Portuguese) required for Macau market');
  }

  // Check tourism industry compliance
  if (!labelData.complianceNotes.some((note: any) =>
    note.toLowerCase().includes('tourism') ||
    note.toLowerCase().includes('hospitality'))) {
    recommendations.push('Consider adding tourism industry compliance notes');
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    warnings,
    recommendations
  };
}

export function validateBrazilCompliance(
  labelData: LabelData,
  productData: ProductData
): ComplianceValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check Brazilian Portuguese requirement
  const hasBrazilianPortuguese =
    labelData.legalLabel.allergens.includes('Contém') ||
    labelData.legalLabel.ingredients.includes('ingredientes');

  if (!hasBrazilianPortuguese) {
    violations.push('Brazilian Portuguese language required for Brazil market');
  }

  // Check ANVISA compliance
  if (!labelData.complianceNotes.some((note: any) =>
    note.toLowerCase().includes('anvisa'))) {
    violations.push('ANVISA compliance requirements not addressed');
  }

  // Check SAC requirement
  if (!labelData.complianceNotes.some((note: any) =>
    note.toLowerCase().includes('sac') ||
    note.toLowerCase().includes('customer service'))) {
    warnings.push('SAC (Customer Service) contact information should be included');
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    warnings,
    recommendations
  };
}

// Enhanced compliance summary for all markets
export function getMarketComplianceSummary(
  labelData: LabelData,
  productData: ProductData
): { [key: string]: ComplianceValidationResult } {
  const results: { [key: string]: ComplianceValidationResult } = {};

  // Base EU compliance
  results.eu = validateEUCompliance(labelData, productData);

  // Market-specific compliance
  switch (productData.market) {
    case 'ES':
      results.spain = validateSpainCompliance(labelData, productData);
      break;
    case 'AO':
      results.angola = validateAngolaCompliance(labelData, productData);
      break;
    case 'MO':
      results.macau = validateMacauCompliance(labelData, productData);
      break;
    case 'BR':
      results.brazil = validateBrazilCompliance(labelData, productData);
      break;
  }

  return results;
}

// Helper function to get market-specific allergen formatting
export function formatMarketAllergens(market: string, allergens: string[]): string {
  if (allergens.length === 0) return '';

  switch (market) {
    case 'ES':
      return `Contiene: ${allergens.join(', ')}`;
    case 'AO':
      return `Contém: ${allergens.join(', ')}`;
    case 'MO':
      return `Contém/含有: ${allergens.join(', ')}`;
    case 'BR':
      return `Contém: ${allergens.join(', ')}`;
    default:
      return `Contains: ${allergens.join(', ')}`;
  }
}

// Export regulatory constants for reference
export {
  EU_LABELING_REQUIREMENTS as EU_REGS,
  SPAIN_SPECIFIC_REQUIREMENTS as SPAIN_REQS,
  ANGOLA_SPECIFIC_REQUIREMENTS as ANGOLA_REQS,
  MACAU_SPECIFIC_REQUIREMENTS as MACAU_REQS,
  BRAZIL_SPECIFIC_REQUIREMENTS as BRAZIL_REQS
};