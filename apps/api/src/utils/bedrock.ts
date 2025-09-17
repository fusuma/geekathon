import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { ProductData, LabelData, LabelDataSchema } from '@repo/shared';

const client = new BedrockRuntimeClient({});

const MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';

export interface GenerateLabelParams {
  productData: ProductData;
}

export class BedrockError extends Error {
  constructor(message: string, public readonly operation: string, public readonly cause?: Error) {
    super(message);
    this.name = 'BedrockError';
  }
}

function createEUSpainLabelPrompt(productData: ProductData): string {
  const { name, ingredients, nutrition, allergens, market } = productData;

  const marketSpecific = market === 'ES' ? 'Spanish' : 'European Union';
  const nutritionInfo = nutrition ? JSON.stringify(nutrition, null, 2) : 'Not provided';
  const allergenInfo = allergens?.join(', ') || 'Not specified';

  return `You are an expert food labeling specialist for ${marketSpecific} markets. Generate a compliant food label for the following product.

PRODUCT INFORMATION:
- Name: ${name}
- Ingredients: ${ingredients.join(', ')}
- Allergens: ${allergenInfo}
- Nutrition Data: ${nutritionInfo}
- Target Market: ${market}

REQUIREMENTS:
- Follow ${marketSpecific} food labeling regulations (EU Regulation 1169/2011 for nutritional information)
- Include mandatory allergen warnings in local language if targeting Spain
- Format ingredients in descending order by weight
- Ensure nutritional information follows EU standards (per 100g/100ml)
- Include appropriate warnings for any health risks
- Provide compliance notes for regulatory requirements

RESPONSE FORMAT (JSON only, no additional text):
{
  "legalLabel": {
    "ingredients": "Comma-separated ingredients in descending order by weight, following ${marketSpecific} naming conventions",
    "allergens": "Clear allergen statement in appropriate language (English for EU, Spanish for ES)",
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
    "short": "Compelling, compliant marketing description (2-3 sentences max)"
  },
  "warnings": [
    "Array of any mandatory warnings based on ingredients/allergens"
  ],
  "complianceNotes": [
    "Array of specific regulatory compliance notes for ${marketSpecific} market"
  ]
}

Generate the label now:`;
}

export async function generateLabelWithAI(params: GenerateLabelParams): Promise<LabelData> {
  const { productData } = params;

  try {
    const prompt = createEUSpainLabelPrompt(productData);

    const input = {
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        system: 'You are a specialized food labeling expert. Respond only with valid JSON that matches the requested format. Do not include any explanatory text.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    if (!response.body) {
      throw new BedrockError('No response body from Bedrock', 'generateLabelWithAI');
    }

    const responseText = Buffer.from(response.body).toString('utf-8');
    const parsedResponse = JSON.parse(responseText);

    // Extract the content from Claude's response format
    const content = parsedResponse.content?.[0]?.text;
    if (!content) {
      throw new BedrockError('No content in Bedrock response', 'generateLabelWithAI');
    }

    // Parse the actual label data from the content
    let labelData: unknown;
    try {
      labelData = JSON.parse(content);
    } catch (parseError) {
      throw new BedrockError(
        `Failed to parse AI response as JSON: ${content}`,
        'generateLabelWithAI',
        parseError instanceof Error ? parseError : undefined
      );
    }

    // Validate the response against our schema
    try {
      const validatedLabelData = LabelDataSchema.parse(labelData);
      return validatedLabelData;
    } catch (validationError) {
      throw new BedrockError(
        `AI response validation failed: ${validationError}`,
        'generateLabelWithAI',
        validationError instanceof Error ? validationError : undefined
      );
    }

  } catch (error) {
    if (error instanceof BedrockError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new BedrockError(
      `Failed to generate label with AI: ${errorMessage}`,
      'generateLabelWithAI',
      error instanceof Error ? error : undefined
    );
  }
}

// Helper function to retry with exponential backoff
export async function generateLabelWithRetry(
  params: GenerateLabelParams,
  maxRetries: number = 3
): Promise<LabelData> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateLabelWithAI(params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new BedrockError(
    `Failed to generate label after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    'generateLabelWithRetry',
    lastError
  );
}