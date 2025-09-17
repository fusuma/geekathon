import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { ProductData, LabelData, LabelDataSchema, Market, Language } from '@repo/shared';
import { buildMarketSpecificPrompt } from '../templates/markets/prompt-builder';
import { translationService } from '../services/translation';
import { createMarketSpecificData } from '../templates/markets/market-config';

const client = new BedrockRuntimeClient({});

const MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';

export interface GenerateLabelParams {
  productData: ProductData;
}

export interface GenerateLabelResult {
  labelData: LabelData;
  translatedData?: LabelData;
  marketSpecificData: any;
  language: Language;
}

export class BedrockError extends Error {
  constructor(message: string, public readonly operation: string, public readonly cause?: Error) {
    super(message);
    this.name = 'BedrockError';
  }
}

function determineLanguage(market: Market, requestedLanguage?: Language): Language {
  if (requestedLanguage) return requestedLanguage;

  switch (market) {
    case 'AO':
    case 'BR':
      return market === 'BR' ? 'pt-BR' : 'pt';
    case 'MO':
      return 'en'; // Default to English for Macau, with Chinese translation
    case 'ES':
    case 'EU':
    default:
      return 'en';
  }
}

function needsTranslation(market: Market): boolean {
  return ['AO', 'BR'].includes(market);
}

export async function generateLabelWithAI(params: GenerateLabelParams): Promise<GenerateLabelResult> {
  const { productData } = params;

  try {
    // Use market-specific prompt builder
    const prompt = buildMarketSpecificPrompt(productData);
    const language = determineLanguage(productData.market, productData.language);

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
    let validatedLabelData: LabelData;
    try {
      validatedLabelData = LabelDataSchema.parse(labelData);
    } catch (validationError) {
      throw new BedrockError(
        `AI response validation failed: ${validationError}`,
        'generateLabelWithAI',
        validationError instanceof Error ? validationError : undefined
      );
    }

    // Generate translation for Portuguese markets
    let translatedData: LabelData | undefined;
    if (needsTranslation(productData.market)) {
      try {
        translatedData = await translationService.translateLabel(
          validatedLabelData,
          language,
          productData.market
        );
      } catch (translationError) {
        console.warn('Translation failed, proceeding with original data:', translationError);
      }
    }

    // Create market-specific metadata
    const marketSpecificData = createMarketSpecificData(productData.market);

    return {
      labelData: validatedLabelData,
      translatedData,
      marketSpecificData,
      language
    };

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
): Promise<GenerateLabelResult> {
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