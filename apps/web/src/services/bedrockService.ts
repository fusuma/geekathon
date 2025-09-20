import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, BEDROCK_MODEL_ID } from './aws-config';

export interface ProductData {
  name: string;
  serving_size: string;
  servings_per_container: string;
  calories: string;
  total_fat: string;
  protein: string;
  ingredients: string;
}

export interface NutritionLabelData {
  nutrition_facts: {
    serving_size: string;
    servings_per_container: string;
    calories: string;
    nutrients: Array<{
      name: string;
      amount: string;
      unit: string;
      daily_value: string;
      major?: boolean;
      indented?: boolean;
    }>;
    vitamins_minerals: Array<{
      name: string;
      amount: string;
      unit: string;
      daily_value: string;
    }>;
  };
  ingredients: string;
  allergens: string;
  certifications: string[];
  regulatory_notes: string;
  market_specific_warnings: string;
  daily_value_note: string;
}

export async function generateNutritionLabel(
  productData: ProductData, 
  market: string, 
  certifications: string[] = []
): Promise<NutritionLabelData> {
  const marketPrompts: Record<string, string> = {
    spain: "Generate EU-compliant nutrition facts following Regulation (EU) No 1169/2011. Include Spanish translations where appropriate.",
    angola: "Generate nutrition facts following ARSO standards for African markets. Include Portuguese translations.",
    macau: "Generate nutrition facts following Chinese/Macau SAR food labeling requirements. Include Chinese characters.",
    brazil: "Generate nutrition facts following ANVISA Resolution RDC 429/2020. Use Portuguese language and include ALÉRGENOS prefix.",
    halal: "Include Halal certification requirements and compliance notes. Ensure all ingredients are Halal-compliant."
  };

  const prompt = `
Create comprehensive nutrition label data for this product:
Product: ${JSON.stringify(productData)}
Target Market: ${market}
Certifications: ${certifications.join(', ')}

Market Requirements: ${marketPrompts[market] || marketPrompts.spain}

Return ONLY a valid JSON object with this exact structure:
{
  "nutrition_facts": {
    "serving_size": "1 Scoop (37.4g)",
    "servings_per_container": "25",
    "calories": "150",
    "nutrients": [
      {"name": "Total Fat", "amount": "3", "unit": "g", "daily_value": "4", "major": true},
      {"name": "Saturated Fat", "amount": "3", "unit": "g", "daily_value": "15", "indented": true},
      {"name": "Trans Fat", "amount": "0", "unit": "g", "daily_value": "", "indented": true},
      {"name": "Cholesterol", "amount": "0", "unit": "mg", "daily_value": "0"},
      {"name": "Sodium", "amount": "125", "unit": "mg", "daily_value": "5"},
      {"name": "Total Carbohydrate", "amount": "6", "unit": "g", "daily_value": "2", "major": true},
      {"name": "Dietary Fiber", "amount": "0", "unit": "g", "daily_value": "0", "indented": true},
      {"name": "Total Sugars", "amount": "1", "unit": "g", "daily_value": "", "indented": true},
      {"name": "Added Sugars", "amount": "0", "unit": "g", "daily_value": "0", "indented": true},
      {"name": "Protein", "amount": "25", "unit": "g", "daily_value": "50", "major": true}
    ],
    "vitamins_minerals": [
      {"name": "Vitamin D", "amount": "0", "unit": "mcg", "daily_value": "0"},
      {"name": "Calcium", "amount": "120", "unit": "mg", "daily_value": "10"},
      {"name": "Iron", "amount": "0.2", "unit": "mg", "daily_value": "2"},
      {"name": "Potassium", "amount": "160", "unit": "mg", "daily_value": "4"}
    ]
  },
  "ingredients": "100% Grass-Fed Whey Protein Isolate, Coconut Oil Creamer, 100% Vietnamese Robusta Coffee, Monk Fruit Extract, Salt",
  "allergens": "Contains Milk",
  "certifications": ["Halal Certified"],
  "regulatory_notes": "",
  "market_specific_warnings": "",
  "daily_value_note": "The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice."
}

DO NOT include any text outside the JSON object. DO NOT use markdown formatting.
`;

  try {
    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      }),
      contentType: 'application/json'
    });

    const response = await bedrockClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const labelData = JSON.parse(result.content[0].text);
    
    return labelData;
  } catch (error) {
    console.error('Bedrock API Error:', error);
    // Return fallback data if API fails
    return getFallbackLabelData(productData, market);
  }
}

function getFallbackLabelData(productData: ProductData, market: string): NutritionLabelData {
  return {
    nutrition_facts: {
      serving_size: productData.serving_size || "1 serving",
      servings_per_container: productData.servings_per_container || "1",
      calories: productData.calories || "0",
      nutrients: [
        {"name": "Total Fat", "amount": productData.total_fat || "0", "unit": "g", "daily_value": "0", "major": true},
        {"name": "Protein", "amount": productData.protein || "0", "unit": "g", "daily_value": "0", "major": true}
      ],
      vitamins_minerals: []
    },
    ingredients: productData.ingredients || "Not specified",
    allergens: "Please check with manufacturer",
    certifications: [],
    regulatory_notes: `Generated for ${market} market`,
    market_specific_warnings: "",
    daily_value_note: "The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice."
  };
}
