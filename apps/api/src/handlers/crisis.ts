import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  CrisisScenarioSchema,
  CrisisResponse,
  CrisisType,
  CrisisSeverity,
  Market,
  Language,
  Label,
  CommunicationMaterial,
  ActionItem,
  CrisisScenario,
  CrisisLog
} from '@repo/shared';

/**
 * Crisis Response Lambda Handler
 * Implements rapid crisis response generation with 10-second target
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();

  try {
    // Parse and validate input
    const body = JSON.parse(event.body || '{}');
    const scenario = CrisisScenarioSchema.parse(body);

    // Generate unique crisis ID
    const crisisId = `crisis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Assess crisis severity and determine response urgency
    const urgencyMultiplier = getCrisisUrgencyMultiplier(scenario.severity);

    // Generate crisis response components in parallel for speed
    const [revisedLabels, communicationMaterials, actionPlan, estimatedImpact] = await Promise.all([
      generateRevisedLabels(scenario),
      generateCommunicationMaterials(scenario),
      generateActionPlan(scenario),
      assessCrisisImpact(scenario)
    ]);

    // Build complete crisis response
    const crisisResponse: CrisisResponse = {
      crisisId,
      scenario,
      revisedLabels,
      communicationMaterials,
      actionPlan,
      generatedAt: new Date().toISOString(),
      estimatedImpact
    };

    // Log crisis for audit trail (implement in Task 5)
    await logCrisisResponse(crisisResponse);

    const processingTime = Date.now() - startTime;
    console.log(`Crisis response generated in ${processingTime}ms for ${scenario.crisisType} crisis`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        success: true,
        data: crisisResponse,
        processingTime,
        urgencyLevel: scenario.severity
      }),
    };

  } catch (error) {
    console.error('Crisis response generation failed:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Crisis response generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

/**
 * Generate revised product labels with crisis warnings
 */
async function generateRevisedLabels(scenario: CrisisScenario): Promise<Record<Market, Label>> {
  const labels: Record<Market, Label> = {} as Record<Market, Label>;

  for (const market of scenario.affectedMarkets) {
    const warningMessages = generateCrisisWarnings(scenario.crisisType, scenario.severity, market);
    const complianceNotes = generateComplianceNotes(scenario.crisisType, market);

    labels[market as Market] = {
      labelId: `crisis-label-${market}-${Date.now()}`,
      productId: scenario.affectedProducts[0], // Use first affected product
      market,
      language: getMarketLanguage(market),
      labelData: {
        legalLabel: {
          ingredients: `CRISIS UPDATE: ${scenario.description}. Original ingredients may be affected.`,
          allergens: scenario.crisisType === 'allergen'
            ? `CRITICAL ALLERGEN WARNING: ${scenario.description}`
            : 'Please check with manufacturer before consumption',
          nutrition: {} // Simplified for crisis mode
        },
        marketing: {
          short: `IMPORTANT SAFETY NOTICE - ${scenario.affectedProducts[0]}`
        },
        warnings: warningMessages,
        complianceNotes
      },
      marketSpecificData: {
        certifications: ['Crisis Response Label'],
        localRegulations: getMarketCrisisRegulations(market),
        culturalConsiderations: getMarketCrisisCulturalConsiderations(market)
      },
      createdAt: new Date().toISOString(),
      generatedBy: 'crisis-response-system'
    };
  }

  return labels;
}

/**
 * Generate crisis-specific warning messages
 */
function generateCrisisWarnings(crisisType: CrisisType, severity: CrisisSeverity, market: Market): string[] {
  const baseWarnings = {
    contamination: [
      'DO NOT CONSUME - POTENTIAL CONTAMINATION',
      'RETURN TO STORE IMMEDIATELY',
      'CONTACT POISON CONTROL IF CONSUMED'
    ],
    allergen: [
      'CRITICAL ALLERGEN WARNING',
      'MAY CONTAIN UNDECLARED ALLERGENS',
      'DO NOT CONSUME IF ALLERGIC'
    ],
    packaging: [
      'INCORRECT PACKAGING DETECTED',
      'VERIFY PRODUCT CONTENTS BEFORE USE',
      'CONTACT MANUFACTURER FOR REPLACEMENT'
    ],
    regulatory: [
      'REGULATORY COMPLIANCE ISSUE',
      'PRODUCT RECALL IN EFFECT',
      'AWAIT FURTHER INSTRUCTIONS'
    ],
    'supply-chain': [
      'SUPPLY CHAIN DISRUPTION',
      'INGREDIENT SOURCE COMPROMISED',
      'QUALITY ASSURANCE UNDER REVIEW'
    ]
  };

  const warnings = baseWarnings[crisisType] || ['GENERAL SAFETY NOTICE'];

  // Add severity-specific warnings
  if (severity === 'critical') {
    warnings.unshift('CRITICAL SAFETY ALERT');
  }

  // Add market-specific warnings
  if (market === 'EU' || market === 'ES') {
    warnings.push('EFSA NOTIFICATION FILED');
  } else if (market === 'BR') {
    warnings.push('ANVISA NOTIFICATION FILED');
  }

  return warnings;
}

/**
 * Generate compliance notes for different markets
 */
function generateComplianceNotes(crisisType: CrisisType, market: Market): string[] {
  const notes = [`Crisis type: ${crisisType}`, `Market: ${market}`, `Generated: ${new Date().toISOString()}`];

  switch (market) {
    case 'EU':
    case 'ES':
      notes.push('EU Food Safety Authority notified');
      notes.push('HACCP procedures activated');
      break;
    case 'BR':
      notes.push('ANVISA notification submitted');
      notes.push('Brazilian food safety protocols engaged');
      break;
    case 'AO':
      notes.push('Angola food authority contacted');
      notes.push('Portuguese language materials prepared');
      break;
    case 'MO':
      notes.push('Macau food safety bureau informed');
      notes.push('Dual authority reporting (China/Portugal) initiated');
      break;
  }

  return notes;
}

/**
 * Generate communication materials for crisis response
 */
async function generateCommunicationMaterials(scenario: CrisisScenario): Promise<CommunicationMaterial[]> {
  const materials: CommunicationMaterial[] = [];

  for (const market of scenario.affectedMarkets) {
    const language = getMarketLanguage(market);

    // Press Release
    materials.push({
      type: 'press-release',
      market,
      language,
      content: generatePressRelease(scenario, market),
      urgency: scenario.severity,
      reviewRequired: scenario.severity === 'critical'
    });

    // Regulatory Notice
    materials.push({
      type: 'regulatory-notice',
      market,
      language,
      content: generateRegulatoryNotice(scenario, market),
      urgency: scenario.severity,
      reviewRequired: true
    });

    // Customer Email
    materials.push({
      type: 'customer-email',
      market,
      language,
      content: generateCustomerEmail(scenario, market),
      urgency: scenario.severity,
      reviewRequired: false
    });

    // Social Media Response
    materials.push({
      type: 'social-media',
      market,
      language,
      content: generateSocialMediaResponse(scenario, market),
      urgency: scenario.severity,
      reviewRequired: scenario.severity === 'critical'
    });

    // Internal Memo
    materials.push({
      type: 'internal-memo',
      market,
      language,
      content: generateInternalMemo(scenario, market),
      urgency: scenario.severity,
      reviewRequired: false
    });
  }

  return materials;
}

/**
 * Generate action plan for crisis response
 */
async function generateActionPlan(scenario: CrisisScenario): Promise<ActionItem[]> {
  const actions: ActionItem[] = [];

  // Immediate actions
  actions.push({
    action: 'Halt production and distribution of affected products',
    priority: 'critical',
    timeframe: 'Immediate (0-15 minutes)',
    responsible: 'Production Manager',
    completed: false
  });

  actions.push({
    action: 'Notify regulatory authorities',
    priority: 'critical',
    timeframe: 'Within 2 hours',
    responsible: 'Compliance Officer',
    completed: false
  });

  // Crisis-specific actions
  switch (scenario.crisisType) {
    case 'contamination':
      actions.push({
        action: 'Initiate product recall process',
        priority: 'critical',
        timeframe: 'Within 4 hours',
        responsible: 'Quality Assurance Manager',
        completed: false
      });
      break;
    case 'allergen':
      actions.push({
        action: 'Update allergen management procedures',
        priority: 'high',
        timeframe: 'Within 24 hours',
        responsible: 'Food Safety Manager',
        completed: false
      });
      break;
    case 'packaging':
      actions.push({
        action: 'Audit packaging supplier',
        priority: 'high',
        timeframe: 'Within 48 hours',
        responsible: 'Supply Chain Manager',
        completed: false
      });
      break;
  }

  // Communication actions
  actions.push({
    action: 'Issue public communication',
    priority: scenario.severity,
    timeframe: 'Within 6 hours',
    responsible: 'Communications Manager',
    completed: false
  });

  actions.push({
    action: 'Customer service crisis protocol activation',
    priority: 'high',
    timeframe: 'Within 1 hour',
    responsible: 'Customer Service Manager',
    completed: false
  });

  return actions;
}

/**
 * Assess estimated impact of crisis
 */
async function assessCrisisImpact(scenario: CrisisScenario): Promise<string> {
  const factors = {
    severity: scenario.severity,
    affectedProducts: scenario.affectedProducts.length,
    affectedMarkets: scenario.affectedMarkets.length,
    crisisType: scenario.crisisType
  };

  let impact = `${factors.severity.toUpperCase()} SEVERITY crisis affecting ${factors.affectedProducts} product(s) across ${factors.affectedMarkets} market(s). `;

  switch (scenario.crisisType) {
    case 'contamination':
      impact += 'HIGH RISK to consumer safety. Immediate recall recommended. ';
      break;
    case 'allergen':
      impact += 'CRITICAL RISK for allergic consumers. Targeted recall necessary. ';
      break;
    case 'packaging':
      impact += 'MODERATE RISK from labeling errors. Corrective labeling required. ';
      break;
    case 'regulatory':
      impact += 'COMPLIANCE RISK. Legal review and product reformulation may be needed. ';
      break;
    case 'supply-chain':
      impact += 'QUALITY RISK. Supply chain audit and ingredient verification required. ';
      break;
  }

  impact += `Expected recovery time: ${getExpectedRecoveryTime(scenario)}`;

  return impact;
}

/**
 * Log crisis response to DynamoDB for audit trail
 */
async function logCrisisResponse(crisisResponse: CrisisResponse): Promise<void> {
  const { saveCrisisLog } = await import('../utils/dynamodb');

  const crisisLog: CrisisLog = {
    crisisId: crisisResponse.crisisId,
    productId: crisisResponse.scenario.affectedProducts[0], // Use first affected product
    crisisType: crisisResponse.scenario.crisisType,
    severity: crisisResponse.scenario.severity,
    scenario: crisisResponse.scenario,
    response: crisisResponse,
    timestamp: crisisResponse.generatedAt,
    createdBy: 'crisis-response-system'
  };

  try {
    await saveCrisisLog({ crisisLog });
    console.log(`Crisis logged: ${crisisResponse.crisisId}`);
  } catch (error) {
    console.error(`Failed to log crisis ${crisisResponse.crisisId}:`, error);
    // Don't throw error to avoid breaking crisis response generation
  }
}

// Helper functions
function getCrisisUrgencyMultiplier(severity: CrisisSeverity): number {
  return { low: 1, medium: 1.5, high: 2, critical: 3 }[severity] || 1;
}

function getMarketLanguage(market: Market): Language {
  const languageMap: Record<Market, Language> = {
    EU: 'en',
    ES: 'en',
    AO: 'pt',
    MO: 'pt',
    BR: 'pt-BR'
  };
  return languageMap[market] || 'en';
}

function getMarketCrisisRegulations(market: Market): string[] {
  const regulations = {
    EU: ['EU Regulation 178/2002', 'EFSA Guidelines'],
    ES: ['Spanish Food Safety Code', 'EU Compliance'],
    AO: ['Angola Food Safety Act', 'Portuguese Standards'],
    MO: ['Macau Food Safety Code', 'China Food Safety Law'],
    BR: ['ANVISA Resolution', 'Brazilian Food Code']
  };
  return regulations[market] || ['Local Food Safety Regulations'];
}

function getMarketCrisisCulturalConsiderations(market: Market): string[] {
  const considerations = {
    EU: ['Multi-cultural sensitivity', 'GDPR compliance in communications'],
    ES: ['Spanish cultural norms', 'Regional autonomy considerations'],
    AO: ['Portuguese colonial legacy awareness', 'Local economic sensitivity'],
    MO: ['Chinese-Portuguese cultural bridge', 'Gaming industry considerations'],
    BR: ['Brazilian cultural directness', 'Large population impact awareness']
  };
  return considerations[market] || ['Local cultural norms'];
}

function getExpectedRecoveryTime(scenario: CrisisScenario): string {
  const baseTimes: Record<CrisisType, string> = {
    contamination: '2-4 weeks',
    allergen: '1-3 weeks',
    packaging: '3-7 days',
    regulatory: '4-12 weeks',
    'supply-chain': '2-8 weeks'
  };
  return baseTimes[scenario.crisisType] || '1-4 weeks';
}

// Communication template generators
function generatePressRelease(scenario: CrisisScenario, market: Market): string {
  return `IMMEDIATE RELEASE - ${scenario.severity.toUpperCase()} FOOD SAFETY NOTICE

Product Safety Alert: ${scenario.affectedProducts.join(', ')}

${new Date().toLocaleDateString()} - Our company is issuing an immediate safety notice regarding ${scenario.description}.

We are taking immediate action to address this ${scenario.crisisType} issue affecting products distributed in ${market}. Consumer safety is our highest priority.

Immediate Actions:
- Production halt initiated
- Regulatory authorities notified
- Customer service lines activated

Consumers should discontinue use immediately and contact our customer service at [CONTACT INFO].

We will provide regular updates as the situation develops.`;
}

function generateRegulatoryNotice(scenario: CrisisScenario, market: Market): string {
  return `REGULATORY NOTIFICATION - CRISIS RESPONSE

Authority: ${getMarketRegulator(market)}
Crisis ID: [TO BE ASSIGNED]
Product(s): ${scenario.affectedProducts.join(', ')}
Issue: ${scenario.description}

Classification: ${scenario.severity.toUpperCase()} severity ${scenario.crisisType}

Actions Taken:
1. Immediate production cessation
2. Distribution halt implemented
3. Internal crisis team activated

Timeline: ${scenario.timeline}

Contact: [Regulatory Affairs Contact Information]

This notification is submitted in compliance with local food safety regulations.`;
}

function generateCustomerEmail(scenario: CrisisScenario, market: Market): string {
  return `Subject: Important Safety Notice - ${scenario.affectedProducts[0]}

Dear Valued Customer,

We are writing to inform you of an important safety matter regarding ${scenario.affectedProducts.join(', ')}.

Issue: ${scenario.description}

For your safety, please:
- Discontinue use of the affected product(s) immediately
- Check your pantry for any of these products
- Contact us for a full refund or replacement

Your safety is our top priority. We sincerely apologize for any inconvenience.

Customer Service: [CONTACT INFO]
Available 24/7 during this crisis

Best regards,
Customer Safety Team`;
}

function generateSocialMediaResponse(scenario: CrisisScenario, market: Market): string {
  return `🚨 SAFETY ALERT: We're issuing an immediate notice for ${scenario.affectedProducts.join(', ')} due to ${scenario.description}. Please discontinue use and contact us for support. Your safety is our priority. #FoodSafety #ImportantNotice`;
}

function generateInternalMemo(scenario: CrisisScenario, market: Market): string {
  return `INTERNAL CRISIS MEMO - CONFIDENTIAL

TO: All Staff, ${market} Operations
FROM: Crisis Response Team
RE: ${scenario.crisisType.toUpperCase()} Crisis - Code ${scenario.severity.toUpperCase()}

SITUATION: ${scenario.description}

IMMEDIATE ACTIONS REQUIRED:
1. All hands on deck for crisis response
2. Refer all media inquiries to Communications
3. Document all actions taken
4. Report to crisis command center hourly

TIMELINE: ${scenario.timeline}

This is a ${scenario.severity} priority situation. Follow all established crisis protocols.

Crisis Hotline: [INTERNAL NUMBER]`;
}

function getMarketRegulator(market: Market): string {
  const regulators = {
    EU: 'European Food Safety Authority (EFSA)',
    ES: 'Spanish Agency for Food Safety and Nutrition (AESAN)',
    AO: 'Angola National Food Safety Authority',
    MO: 'Macau Food and Drug Administration',
    BR: 'Brazilian Health Surveillance Agency (ANVISA)'
  };
  return regulators[market] || 'Local Food Safety Authority';
}