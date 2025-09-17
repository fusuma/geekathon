import { HelloWorldResponse, Label, ProductData, NutritionFactSheet, Market } from '@repo/shared';
import { ProductInputFormData } from './schemas';

// API base URL - in development, this will be our local SAM API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// Multi-market generation request
export interface MultiMarketRequest {
  productData: ProductData;
  markets: Market[];
}

// Multi-market generation response
export interface MultiMarketResponse {
  labels: Partial<Record<Market, Label>>;
  timestamp: string;
}

export async function fetchHello(): Promise<HelloWorldResponse> {
  const response = await fetch(`${API_BASE_URL}/hello`);

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
}

// Transform form data to ProductData format
function transformFormToProductData(formData: ProductInputFormData): ProductData {
  const ingredients = formData.ingredients
    .split(',')
    .map(ingredient => ingredient.trim())
    .filter(ingredient => ingredient.length > 0);

  const allergens = formData.allergens
    ? formData.allergens.split(',').map(allergen => allergen.trim()).filter(allergen => allergen.length > 0)
    : undefined;

  // Build nutrition data if any values provided
  const nutrition: Partial<NutritionFactSheet> = {};
  if (formData.energy) nutrition.energy = { per100g: { value: parseFloat(formData.energy), unit: 'kcal' } };
  if (formData.fat) nutrition.fat = { per100g: { value: parseFloat(formData.fat), unit: 'g' } };
  if (formData.saturatedFat) nutrition.saturatedFat = { per100g: { value: parseFloat(formData.saturatedFat), unit: 'g' } };
  if (formData.carbohydrates) nutrition.carbohydrates = { per100g: { value: parseFloat(formData.carbohydrates), unit: 'g' } };
  if (formData.sugars) nutrition.sugars = { per100g: { value: parseFloat(formData.sugars), unit: 'g' } };
  if (formData.protein) nutrition.protein = { per100g: { value: parseFloat(formData.protein), unit: 'g' } };
  if (formData.salt) nutrition.salt = { per100g: { value: parseFloat(formData.salt), unit: 'g' } };
  if (formData.fiber) nutrition.fiber = { per100g: { value: parseFloat(formData.fiber), unit: 'g' } };

  return {
    name: formData.name,
    ingredients,
    market: formData.market,
    allergens,
    nutrition: Object.keys(nutrition).length > 0 ? nutrition : undefined,
  };
}

export async function generateLabel(formData: ProductInputFormData): Promise<Label> {
  const productData = transformFormToProductData(formData);

  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Label generation failed: ${response.status}`);
  }

  return response.json();
}

// Generate labels for multiple markets
export async function generateMultiMarketLabels(productData: ProductData, markets: Market[]): Promise<MultiMarketResponse> {
  // For now, generate individual labels for each market
  // TODO: In the future, we could optimize this with a batch endpoint
  const labelPromises = markets.map(async (market) => {
    const marketProductData = { ...productData, market };
    const label = await generateSingleMarketLabel(marketProductData);
    return { market, label };
  });

  const results = await Promise.all(labelPromises);
  const labels: Partial<Record<Market, Label>> = {};

  results.forEach(({ market, label }) => {
    labels[market] = label;
  });

  return {
    labels,
    timestamp: new Date().toISOString(),
  };
}

// Helper function for single market generation
async function generateSingleMarketLabel(productData: ProductData): Promise<Label> {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Label generation failed for ${productData.market}: ${response.status}`);
  }

  return response.json();
}