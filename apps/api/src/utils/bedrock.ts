import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { ProductData, LabelData, LabelDataSchema, Market, Language, CrisisType, CrisisSeverity } from '@repo/shared';
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

// Crisis Response Extensions
export interface CrisisPromptParams {
  crisisType: CrisisType;
  severity: CrisisSeverity;
  description: string;
  affectedProducts: string[];
  affectedMarkets: Market[];
  timeline: string;
}

/**
 * Generate crisis-specific AI response using AWS Bedrock Claude
 * Optimized for 10-second response time requirement
 */
export async function generateCrisisResponse(
  promptType: 'label' | 'communication' | 'action-plan',
  params: CrisisPromptParams,
  market?: Market
): Promise<string> {
  try {
    const prompt = buildCrisisPrompt(promptType, params, market);
    const aiConfig = getCrisisAIConfig(params.severity);

    const input = {
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    if (!response.body) {
      throw new BedrockError('No response body from Bedrock', 'generateCrisisResponse');
    }

    const responseText = Buffer.from(response.body).toString('utf-8');
    const parsedResponse = JSON.parse(responseText);

    return parsedResponse.content[0]?.text || 'Crisis response generation failed';

  } catch (error) {
    console.error('Bedrock crisis response generation failed:', error);
    // Use fallback templates for crisis situations
    return getCrisisFallbackResponse(promptType, params, market);
  }
}

/**
 * Build crisis-specific prompts optimized for different response types
 */
function buildCrisisPrompt(
  promptType: 'label' | 'communication' | 'action-plan',
  params: CrisisPromptParams,
  market?: Market
): string {
  const baseContext = `
CRISIS SITUATION ANALYSIS:
- Crisis Type: ${params.crisisType}
- Severity: ${params.severity}
- Description: ${params.description}
- Affected Products: ${params.affectedProducts.join(', ')}
- Markets: ${params.affectedMarkets.join(', ')}
- Timeline: ${params.timeline}

CRITICAL REQUIREMENTS:
- This is a ${params.severity} severity crisis requiring immediate action
- Consumer safety is the absolute top priority
- All responses must be legally compliant and transparent
- Response must be appropriate for ${market || 'all affected markets'}
- Generate response in under 5 seconds for urgency
`;

  switch (promptType) {
    case 'label':
      return `${baseContext}

TASK: Generate revised product label content for crisis response.

REQUIREMENTS:
- Include prominent crisis warnings
- Update ingredient and allergen information if relevant
- Add compliance notes for ${market} market
- Use clear, urgent language for consumer safety
- Follow ${market} labeling regulations

Generate only the essential label content with crisis warnings.`;

    case 'communication':
      return `${baseContext}

TASK: Generate crisis communication materials.

REQUIREMENTS:
- Professional, transparent, and reassuring tone
- Acknowledge the issue without admitting liability
- Provide clear actions for consumers
- Include contact information placeholders
- Appropriate for ${market} cultural context
- Follow crisis communication best practices

Generate press release, customer email, and regulatory notice.`;

    case 'action-plan':
      return `${baseContext}

TASK: Generate crisis response action plan.

REQUIREMENTS:
- Immediate actions (0-2 hours)
- Short-term actions (2-24 hours)
- Medium-term actions (1-7 days)
- Assign priority levels (critical, high, medium, low)
- Include responsible roles
- Consider ${params.crisisType} specific requirements

Generate prioritized action items with timeframes.`;

    default:
      return `${baseContext}

Generate a comprehensive crisis response addressing the ${params.crisisType} issue.`;
  }
}

/**
 * Get crisis urgency configuration for AI model parameters
 */
function getCrisisAIConfig(severity: CrisisSeverity) {
  const configs = {
    critical: {
      maxTokens: 1500, // Shorter for speed
      temperature: 0.1, // Most consistent
      timeout: 5000 // 5 second max
    },
    high: {
      maxTokens: 2000,
      temperature: 0.2,
      timeout: 7000
    },
    medium: {
      maxTokens: 2500,
      temperature: 0.3,
      timeout: 10000
    },
    low: {
      maxTokens: 3000,
      temperature: 0.4,
      timeout: 15000
    }
  };

  const severityConfigs: Record<CrisisSeverity, any> = configs;
  return severityConfigs[severity] || configs.medium;
}

/**
 * Crisis-specific fallback templates for when AI service is unavailable
 */
const CRISIS_FALLBACK_TEMPLATES: Record<CrisisType, { warning: string; action: string; communication: string }> = {
  contamination: {
    warning: 'DO NOT CONSUME - POTENTIAL CONTAMINATION DETECTED',
    action: 'Stop all production and distribution immediately',
    communication: 'We are issuing an immediate voluntary recall due to potential contamination.'
  },
  allergen: {
    warning: 'CRITICAL ALLERGEN WARNING - MAY CONTAIN UNDECLARED ALLERGENS',
    action: 'Update allergen management procedures and labeling',
    communication: 'Important allergen safety notice requiring immediate attention.'
  },
  packaging: {
    warning: 'PACKAGING ERROR DETECTED - VERIFY CONTENTS BEFORE USE',
    action: 'Audit packaging processes and supplier quality control',
    communication: 'Packaging correction notice and replacement program initiated.'
  },
  regulatory: {
    warning: 'REGULATORY COMPLIANCE ISSUE - PRODUCT RECALL IN EFFECT',
    action: 'Engage legal counsel and regulatory affairs team',
    communication: 'Regulatory compliance update and corrective action plan.'
  },
  'supply-chain': {
    warning: 'SUPPLY CHAIN QUALITY CONCERN - INGREDIENT VERIFICATION REQUIRED',
    action: 'Conduct immediate supplier audit and ingredient testing',
    communication: 'Supply chain quality assurance review and strengthening measures.'
  }
};

/**
 * Get fallback crisis response when AI is unavailable
 */
function getCrisisFallbackResponse(
  promptType: 'label' | 'communication' | 'action-plan',
  params: CrisisPromptParams,
  market?: Market
): string {
  const template = CRISIS_FALLBACK_TEMPLATES[params.crisisType];
  
  if (!template) {
    return `Crisis fallback response for ${params.crisisType}`;
  }

  switch (promptType) {
    case 'label':
      return template.warning;
    case 'communication':
      return template.communication;
    case 'action-plan':
      return template.action;
    default:
      return `Crisis fallback response for ${params.crisisType}`;
  }
}