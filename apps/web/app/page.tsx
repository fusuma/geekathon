'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Label } from '@repo/shared';
import { generateLabel } from '../lib/api';
import { ProductInputForm } from '../components/product-input-form';
import { LabelDisplay } from '../components/label-display';
import { AiGenerationTrace } from '../components/loading-spinner';
import { ProductInputFormData } from '../lib/schemas';

type ViewState = 'input' | 'generating' | 'results';

export default function HomePage() {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [generatedLabel, setGeneratedLabel] = useState<Label | null>(null);

  const generateMutation = useMutation({
    mutationFn: generateLabel,
    onSuccess: (label) => {
      setGeneratedLabel(label);
      setViewState('results');
    },
    onError: (error) => {
      console.error('Label generation failed:', error);
      setViewState('input');
    },
  });

  const handleFormSubmit = (data: ProductInputFormData) => {
    setViewState('generating');
    generateMutation.mutate(data);
  };

  const handleGenerateNew = () => {
    setViewState('input');
    setGeneratedLabel(null);
    generateMutation.reset();
  };

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-100">
              SmartLabel AI
            </h1>
            <p className="mt-2 text-lg text-gray-300">
              AI-powered smart food labeling for EU markets
            </p>
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
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <AiGenerationTrace />
          </div>
        )}

        {viewState === 'results' && generatedLabel && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <LabelDisplay
              label={generatedLabel}
              onGenerateNew={handleGenerateNew}
            />
          </div>
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