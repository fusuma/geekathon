"use client";

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
// import { CrisisResponse } from '@repo/shared'; // Type not available in shared package
import { CrisisInputForm, CrisisInputFormData } from './crisis-input-form';
import { CrisisResponseDisplay } from './crisis-response-display';
import { CrisisGenerationTrace } from './crisis-generation-trace';
import { Button } from '@/components/ui/button';

type CrisisViewState = 'input' | 'generating' | 'results';

// Define CrisisResponse type locally since it's not available in shared package
interface CrisisResponse {
  crisisId: string;
  scenario: {
    crisisType: string;
    severity: string;
    affectedProducts: string[];
    affectedMarkets: string[];
    description: string;
    timeline: string;
    immediateActions?: string[];
  };
  revisedLabels: Record<string, any>;
  communicationMaterials: any[];
  actionPlan: any[];
  generatedAt: string;
  estimatedImpact: string;
}

// Mock crisis API call - replace with actual API call
const generateCrisisResponse = async (data: CrisisInputFormData): Promise<CrisisResponse> => {
  // Simulate API delay for crisis urgency (under 10 seconds)
  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 4000));

  const crisisId = `crisis_${Date.now()}`;
  const currentTime = new Date().toISOString();

  // Mock response structure
  const mockResponse: CrisisResponse = {
    crisisId,
    scenario: {
      crisisType: data.crisisType,
      severity: data.severity,
      affectedProducts: data.affectedProducts.split(',').map(p => p.trim()),
      affectedMarkets: data.affectedMarkets,
      description: data.description,
      timeline: data.timeline,
      immediateActions: data.immediateActions ? [data.immediateActions] : undefined,
    },
    revisedLabels: data.affectedMarkets.reduce((acc, market) => {
      acc[market] = {
        labelId: `${crisisId}_label_${market}`,
        market,
        language: market === 'BR' ? 'pt-BR' : market === 'AO' || market === 'MO' ? 'pt' : 'en',
        labelData: {
          legalLabel: {
            ingredients: "Updated ingredients with crisis warnings",
            allergens: "⚠️ CRISIS ALERT: Contains allergens. Check for contamination.",
            nutrition: {}
          },
          marketing: {
            short: `⚠️ CRISIS UPDATE: ${data.affectedProducts.split(',')[0]?.trim()}`
          },
          warnings: [
            "⚠️ PRODUCT RECALL NOTICE",
            "Do not consume - potential contamination",
            "Contact customer service immediately"
          ],
          complianceNotes: ["Crisis response generated", "Requires immediate review"]
        },
        marketSpecificData: {
          certifications: [],
          localRegulations: [`${market} emergency protocols activated`],
          culturalConsiderations: ["Crisis communication adapted for market"]
        },
        createdAt: currentTime,
        generatedBy: "Crisis Response System"
      };
      return acc;
    }, {} as any),
    communicationMaterials: data.affectedMarkets.flatMap(market => [
      {
        type: 'press-release' as const,
        market,
        language: market === 'BR' ? 'pt-BR' as const : market === 'AO' || market === 'MO' ? 'pt' as const : 'en' as const,
        content: `IMMEDIATE PRESS RELEASE - ${data.crisisType.toUpperCase()} CRISIS

${data.description}

We are taking immediate action to address this ${data.severity} severity ${data.crisisType} crisis affecting our ${data.affectedProducts.split(',').map(p => p.trim()).join(', ')} products.

IMMEDIATE ACTIONS:
- Production halt for affected batches
- Full investigation launched
- Customer notifications sent
- Regulatory authorities contacted

We apologize for any inconvenience and are committed to resolving this matter with full transparency.

For more information, contact our crisis hotline: 1-800-CRISIS-1

Media Contact: crisis.media@smartlabel.ai
Customer Service: help@smartlabel.ai`,
        urgency: data.severity,
        reviewRequired: data.severity === 'critical' || data.severity === 'high'
      },
      {
        type: 'customer-email' as const,
        market,
        language: market === 'BR' ? 'pt-BR' as const : market === 'AO' || market === 'MO' ? 'pt' as const : 'en' as const,
        content: `Subject: URGENT: Product Safety Notice - ${data.affectedProducts.split(',')[0]?.trim()}

Dear Valued Customer,

We are writing to inform you of an urgent product safety issue involving ${data.affectedProducts.split(',').map(p => p.trim()).join(', ')}.

WHAT HAPPENED:
${data.description}

WHAT YOU SHOULD DO:
1. Stop using the affected products immediately
2. Check your products against the batch codes listed below
3. Return unused products for a full refund
4. Contact us if you have consumed the product

AFFECTED PRODUCTS:
${data.affectedProducts}

We sincerely apologize for this situation and any concern it may cause. Your safety is our top priority.

For immediate assistance:
- Call: 1-800-CRISIS-1
- Email: crisis.support@smartlabel.ai
- Visit: smartlabel.ai/crisis

Thank you for your understanding.

SmartLabel Crisis Response Team`,
        urgency: data.severity,
        reviewRequired: false
      },
      {
        type: 'regulatory-notice' as const,
        market,
        language: market === 'BR' ? 'pt-BR' as const : market === 'AO' || market === 'MO' ? 'pt' as const : 'en' as const,
        content: `REGULATORY NOTIFICATION - ${market} MARKET

TO: Relevant Food Safety Authorities
RE: ${data.crisisType.toUpperCase()} Crisis Notification

Company: SmartLabel AI Food Manufacturing
Date: ${new Date().toLocaleDateString()}
Crisis ID: ${crisisId}

CRISIS DETAILS:
- Type: ${data.crisisType}
- Severity: ${data.severity}
- Products Affected: ${data.affectedProducts}
- Market: ${market}
- Timeline: ${data.timeline}

DESCRIPTION:
${data.description}

IMMEDIATE ACTIONS TAKEN:
${data.immediateActions || 'Production halt, investigation initiated, customer notifications sent'}

CORRECTIVE MEASURES:
- Full product recall initiated
- Root cause analysis in progress
- Enhanced quality control measures implemented
- Customer communication plan activated

We are cooperating fully with all regulatory requirements and will provide updates as the investigation progresses.

Contact: regulatory@smartlabel.ai
Emergency Line: +1-800-REG-CRISIS

SmartLabel Regulatory Affairs Team`,
        urgency: data.severity,
        reviewRequired: true
      }
    ]),
    actionPlan: [
      {
        action: "Halt production of affected products immediately",
        priority: data.severity,
        timeframe: "Immediate (0-1 hour)",
        responsible: "Production Manager",
        completed: true
      },
      {
        action: "Contact regulatory authorities in all affected markets",
        priority: data.severity,
        timeframe: "Immediate (1-2 hours)",
        responsible: "Regulatory Affairs",
        completed: false
      },
      {
        action: "Issue customer notifications and press releases",
        priority: data.severity,
        timeframe: "Within 4 hours",
        responsible: "Communications Team",
        completed: false
      },
      {
        action: "Conduct full investigation and root cause analysis",
        priority: data.severity,
        timeframe: "24-48 hours",
        responsible: "Quality Assurance",
        completed: false
      },
      {
        action: "Implement corrective and preventive actions",
        priority: data.severity,
        timeframe: "1-2 weeks",
        responsible: "Operations Manager",
        completed: false
      }
    ],
    generatedAt: currentTime,
    estimatedImpact: `${data.severity.toUpperCase()} impact expected across ${data.affectedMarkets.length} markets. Estimated affected products: ${data.affectedProducts.split(',').length}. Immediate recall and customer notification required.`
  };

  return mockResponse;
};

export function CrisisPage() {
  const [viewState, setViewState] = useState<CrisisViewState>('input');
  const [crisisResponse, setCrisisResponse] = useState<CrisisResponse | null>(null);

  const generateMutation = useMutation({
    mutationFn: generateCrisisResponse,
    onMutate: () => {
      setViewState('generating');
    },
    onSuccess: (response) => {
      setCrisisResponse(response);
      setViewState('results');
    },
    onError: (error) => {
      console.error('Crisis response generation failed:', error);
      setViewState('input');
    },
  });

  const handleFormSubmit = (data: CrisisInputFormData) => {
    generateMutation.mutate(data);
  };

  const handleGenerateNew = () => {
    setViewState('input');
    setCrisisResponse(null);
    generateMutation.reset();
  };

  const isUrgent = crisisResponse?.scenario.severity === 'critical' || crisisResponse?.scenario.severity === 'high';

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className={`border-b ${isUrgent ? 'bg-red-900/20 border-red-600/30' : 'bg-gray-800 border-gray-700'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className={`text-3xl font-bold ${isUrgent ? 'text-red-400' : 'text-gray-100'}`}>
                🚨 Crisis Response System
              </h1>
              <p className={`mt-2 text-lg ${isUrgent ? 'text-red-300' : 'text-gray-300'}`}>
                AI-powered crisis management for food safety incidents
              </p>
              {isUrgent && (
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-red-400">
                  <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-semibold">CRITICAL CRISIS RESPONSE ACTIVE</span>
                  <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-0 flex justify-center">
              <Link href="/">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  ← Back to SmartLabel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewState === 'input' && (
          <CrisisInputForm
            onSubmit={handleFormSubmit}
            isLoading={generateMutation.isPending}
          />
        )}

        {viewState === 'generating' && (
          <CrisisGenerationTrace />
        )}

        {viewState === 'results' && crisisResponse && (
          <CrisisResponseDisplay
            response={crisisResponse}
            onGenerateNew={handleGenerateNew}
            isUrgent={isUrgent}
          />
        )}

        {generateMutation.error && (
          <div className="mt-4 bg-red-900/20 border border-red-600/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-400">
              Crisis Response Generation Error
            </h3>
            <p className="text-sm text-red-300 mt-1">
              {generateMutation.error.message}
            </p>
          </div>
        )}
      </div>

      {/* Emergency Footer */}
      <footer className={`border-t mt-16 ${isUrgent ? 'bg-red-900/20 border-red-600/30' : 'bg-gray-800/50 border-gray-700'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-400">
            <p>🚨 Crisis Response System - Powered by SmartLabel AI</p>
            <p className="mt-1">Emergency Response Time Target: &lt; 10 seconds</p>
            {isUrgent && (
              <p className="mt-2 text-red-400 font-semibold">
                CRITICAL SITUATION - Follow all crisis protocols immediately
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}