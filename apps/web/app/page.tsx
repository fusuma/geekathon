'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Label, Market } from '@repo/shared';
import { generateLabel, generateMultiMarketLabels } from '../lib/api';
import { ProductInputForm } from '../components/product-input-form';
import { LabelDisplay } from '../components/label-display';
import { AiGenerationTrace } from '../components/loading-spinner';
import { EnhancedGenerationTrace } from '../components/animations/enhanced-generation-trace';
import { MultiMarketSelector } from '../components/market-selector';
import { SideBySideLayout, SynchronizedComparisonLayout } from '../components/comparison/side-by-side-layout';
import { useAppStore, useSelectedMarkets, useComparisonMode } from '../stores/app-store';
import { ProductInputFormData } from '../lib/schemas';

type ViewState = 'input' | 'generating' | 'results';

export default function HomePage() {
  const [viewState, setViewState] = useState<ViewState>('input');

  // Use Zustand store for multi-market state
  const selectedMarkets = useSelectedMarkets();
  const comparisonMode = useComparisonMode();
  const {
    labels,
    setLabel,
    clearLabels,
    setIsGenerating,
    setGenerationProgress,
    updateGenerationStep
  } = useAppStore();

  // Generation mutation for multi-market support
  const generateMutation = useMutation({
    mutationFn: async (formData: ProductInputFormData) => {
      if (selectedMarkets.length === 1) {
        // Single market generation
        const label = await generateLabel({ ...formData, market: selectedMarkets[0]! });
        return { type: 'single' as const, label, market: selectedMarkets[0]! };
      } else {
        // Multi-market generation
        const productData = {
          name: formData.name,
          ingredients: formData.ingredients.split(',').map(i => i.trim()),
          allergens: formData.allergens?.split(',').map(a => a.trim()),
          market: selectedMarkets[0]!, // Will be overridden in the API call
        };
        const response = await generateMultiMarketLabels(productData, selectedMarkets);
        return { type: 'multi' as const, labels: response.labels };
      }
    },
    onMutate: () => {
      setIsGenerating(true);
      setGenerationProgress([
        { id: 'analyzing', name: 'Analyzing Product', status: 'in_progress' },
        { id: 'regulations', name: 'Researching Regulations', status: 'pending' },
        { id: 'generating', name: 'Generating Content', status: 'pending' },
        { id: 'validating', name: 'Validating Compliance', status: 'pending' },
      ]);
    },
    onSuccess: (result) => {
      if (result.type === 'single') {
        setLabel(result.market!, result.label);
      } else {
        Object.entries(result.labels).forEach(([market, label]) => {
          setLabel(market as Market, label);
        });
      }
      setIsGenerating(false);
      setViewState('results');
    },
    onError: (error) => {
      console.error('Label generation failed:', error);
      setIsGenerating(false);
      setViewState('input');
    },
  });

  const handleFormSubmit = (data: ProductInputFormData) => {
    setViewState('generating');
    generateMutation.mutate(data);
  };

  const handleGenerateNew = () => {
    setViewState('input');
    clearLabels();
    generateMutation.reset();
  };

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-100">
                SmartLabel AI
              </h1>
              <p className="mt-2 text-lg text-gray-300">
                AI-powered smart food labeling for global markets
              </p>
            </div>

            {/* Market Selector */}
            <div className="mt-4 sm:mt-0">
              <MultiMarketSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewState === 'input' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-100 mb-2">
                Generate Smart Label
              </h2>
              <p className="text-gray-300">
                Enter your product information to generate compliant EU food labels with AI assistance.
              </p>
            </div>

            <ProductInputForm
              onSubmit={handleFormSubmit}
              isLoading={generateMutation.isPending}
            />

            {generateMutation.error && (
              <div className="mt-4 bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-400">
                  Generation Error
                </h3>
                <p className="text-sm text-red-300 mt-1">
                  {generateMutation.error.message}
                </p>
              </div>
            )}
          </div>
        )}

        {viewState === 'generating' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 relative overflow-hidden">
            <EnhancedGenerationTrace />
          </div>
        )}

        {viewState === 'results' && Object.keys(labels).length > 0 && (
          comparisonMode && selectedMarkets.length > 1 ? (
            // Enhanced comparison layout
            <SynchronizedComparisonLayout onGenerateNew={handleGenerateNew} />
          ) : selectedMarkets.length > 1 ? (
            // Basic side-by-side layout
            <SideBySideLayout onGenerateNew={handleGenerateNew} />
          ) : (
            // Single label view
            (() => {
              const firstLabel = Object.values(labels)[0];
              return firstLabel ? (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <LabelDisplay
                    label={firstLabel}
                    onGenerateNew={handleGenerateNew}
                  />
                </div>
              ) : null;
            })()
          )
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-400">
            <p>SmartLabel AI - Geekathon 2025 Project</p>
            <p className="mt-1">Powered by AWS Bedrock and Claude AI</p>
          </div>
        </div>
      </footer>
    </main>
  );
}