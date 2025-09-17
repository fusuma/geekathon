// Basic types for the Steel Thread implementation

export interface HelloWorldResponse {
  message: string;
  timestamp: string;
  version: string;
}

// Market and language support types
export type Market = 'EU' | 'ES' | 'AO' | 'MO' | 'BR';
export type Language = 'en' | 'pt' | 'pt-BR';

export interface MarketSpecificData {
  certifications: string[];
  localRegulations: string[];
  culturalConsiderations: string[];
  languageVariant?: string;
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
  market: Market;
  language: Language;
  labelData: LabelData;
  marketSpecificData: MarketSpecificData;
  translatedData?: LabelData; // For Portuguese markets
  createdAt: string;
  generatedBy: string;
}

// Product input data for generation
export interface ProductData {
  name: string;
  ingredients: string[];
  nutrition?: Partial<NutritionFactSheet>;
  allergens?: string[];
  market: Market;
  language?: Language;
  productId?: string;
}