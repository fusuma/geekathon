// Basic types for the Steel Thread implementation

export interface HelloWorldResponse {
  message: string;
  timestamp: string;
  version: string;
}

// Core nutrition data structures
export interface NutritionValue {
  value: number;
  unit: 'g' | 'mg' | 'kcal' | 'kJ' | string;
}

export interface NutritionServingInfo {
  per100g: NutritionValue;
  perServing?: NutritionValue;
  percentDailyValue?: number;
}

export interface NutritionFactSheet {
  energy?: NutritionServingInfo;
  fat?: NutritionServingInfo;
  saturatedFat?: NutritionServingInfo;
  carbohydrates?: NutritionServingInfo;
  sugars?: NutritionServingInfo;
  protein?: NutritionServingInfo;
  salt?: NutritionServingInfo;
  fiber?: NutritionServingInfo;
  [key: string]: NutritionServingInfo | undefined;
}

// Label structure
export interface LegalLabel {
  ingredients: string;
  allergens: string;
  nutrition: NutritionFactSheet;
}

export interface MarketingInfo {
  short: string;
}

export interface LabelData {
  legalLabel: LegalLabel;
  marketing: MarketingInfo;
  warnings: string[];
  complianceNotes: string[];
}

export interface Label {
  labelId: string;
  productId?: string;
  labelData: LabelData;
  market: 'EU' | 'ES';
  createdAt: string;
  generatedBy: string;
}

// Product input data for generation
export interface ProductData {
  name: string;
  ingredients: string[];
  nutrition?: Partial<NutritionFactSheet>;
  allergens?: string[];
  market: 'EU' | 'ES';
  productId?: string;
}