import { z } from 'zod';

// Zod schemas for validation
export const HelloWorldResponseSchema = z.object({
  message: z.string(),
  timestamp: z.string(),
  version: z.string(),
});

// Market and language schemas
export const MarketSchema = z.enum(['EU', 'ES', 'AO', 'MO', 'BR']);
export const LanguageSchema = z.enum(['en', 'pt', 'pt-BR']);

export const MarketSpecificDataSchema = z.object({
  certifications: z.array(z.string()),
  localRegulations: z.array(z.string()),
  culturalConsiderations: z.array(z.string()),
  languageVariant: z.string().optional(),
});

// Core nutrition data schemas
export const NutritionValueSchema = z.object({
  value: z.number(),
  unit: z.string(),
});

export const NutritionServingInfoSchema = z.object({
  per100g: NutritionValueSchema,
  perServing: NutritionValueSchema.optional(),
  percentDailyValue: z.number().optional(),
});

export const NutritionFactSheetSchema = z.object({
  energy: NutritionServingInfoSchema.optional(),
  fat: NutritionServingInfoSchema.optional(),
  saturatedFat: NutritionServingInfoSchema.optional(),
  carbohydrates: NutritionServingInfoSchema.optional(),
  sugars: NutritionServingInfoSchema.optional(),
  protein: NutritionServingInfoSchema.optional(),
  salt: NutritionServingInfoSchema.optional(),
  fiber: NutritionServingInfoSchema.optional(),
}).catchall(NutritionServingInfoSchema.optional());

// Label structure schemas
export const LegalLabelSchema = z.object({
  ingredients: z.string(),
  allergens: z.string(),
  nutrition: NutritionFactSheetSchema,
});

export const MarketingInfoSchema = z.object({
  short: z.string(),
});

export const LabelDataSchema = z.object({
  legalLabel: LegalLabelSchema,
  marketing: MarketingInfoSchema,
  warnings: z.array(z.string()),
  complianceNotes: z.array(z.string()),
});

export const LabelSchema = z.object({
  labelId: z.string(),
  productId: z.string().optional(),
  market: MarketSchema,
  language: LanguageSchema,
  labelData: LabelDataSchema,
  marketSpecificData: MarketSpecificDataSchema,
  translatedData: LabelDataSchema.optional(),
  createdAt: z.string(),
  generatedBy: z.string(),
});

// Product input schema for generation
export const ProductDataSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string()),
  nutrition: NutritionFactSheetSchema.partial().optional(),
  allergens: z.array(z.string()).optional(),
  market: MarketSchema,
  language: LanguageSchema.optional(),
  productId: z.string().optional(),
});

// Crisis Response Schemas
export const CrisisTypeSchema = z.enum(['contamination', 'allergen', 'packaging', 'regulatory', 'supply-chain']);
export const CrisisSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const CrisisScenarioSchema = z.object({
  crisisType: CrisisTypeSchema,
  severity: CrisisSeveritySchema,
  affectedProducts: z.array(z.string()),
  affectedMarkets: z.array(MarketSchema),
  description: z.string(),
  timeline: z.string(),
  immediateActions: z.array(z.string()).optional(),
});

export const CommunicationMaterialSchema = z.object({
  type: z.enum(['press-release', 'regulatory-notice', 'customer-email', 'social-media', 'internal-memo']),
  market: MarketSchema,
  language: LanguageSchema,
  content: z.string(),
  urgency: CrisisSeveritySchema,
  reviewRequired: z.boolean(),
});

export const ActionItemSchema = z.object({
  action: z.string(),
  priority: CrisisSeveritySchema,
  timeframe: z.string(),
  responsible: z.string().optional(),
  completed: z.boolean(),
});

export const CrisisResponseSchema = z.object({
  crisisId: z.string(),
  scenario: CrisisScenarioSchema,
  revisedLabels: z.record(MarketSchema, LabelSchema),
  communicationMaterials: z.array(CommunicationMaterialSchema),
  actionPlan: z.array(ActionItemSchema),
  generatedAt: z.string(),
  estimatedImpact: z.string(),
});

export const CrisisLogSchema = z.object({
  crisisId: z.string(),
  productId: z.string().optional(),
  crisisType: CrisisTypeSchema,
  severity: CrisisSeveritySchema,
  scenario: CrisisScenarioSchema,
  response: CrisisResponseSchema,
  timestamp: z.string(),
  impactAssessment: z.string().optional(),
  resolvedAt: z.string().optional(),
  createdBy: z.string(),
});