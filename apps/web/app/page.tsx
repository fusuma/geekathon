'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { EnhancedProductForm } from '@/components/forms/enhanced-product-form';
import { SimpleGenerationTrace } from '@/components/animations/simple-generation-trace';
import { EnhancedComparisonLayout } from '@/components/comparison/enhanced-comparison-layout';
import { useMutation } from '@tanstack/react-query';

// API function
async function generateLabels(productData: any) {
  const response = await fetch('http://localhost:3001/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export default function HomePage() {
  const {
    viewState,
    isGenerating,
    generationProgress,
    labels,
    selectedMarkets,
    setViewState,
    setGenerating,
    setProgress,
    setLabels,
    setProductData,
    reset,
    resetForm
  } = useAppStore();

        // Generation mutation
        const generateMutation = useMutation({
          mutationFn: generateLabels,
          onSuccess: (data) => {
            console.log('Generation successful:', data);
            // Handle both single label and multiple labels
            const labels = Array.isArray(data.data) ? data.data : [data.data];
            setLabels(labels);
            setViewState('results');
            setGenerating(false);
            setProgress(0);
          },
          onError: (error) => {
            console.error('Generation failed:', error);
            setGenerating(false);
            setProgress(0);
          }
        });

  // Simple progress simulation
  useEffect(() => {
    if (isGenerating) {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 10;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
        }
        setProgress(currentProgress);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isGenerating, setProgress]);

  const handleGenerate = async (formData: any) => {
    try {
      console.log('=== GENERATION START ===');
      console.log('Raw formData received:', formData);
      console.log('formData type:', typeof formData);
      console.log('formData keys:', Object.keys(formData || {}));
      
      setViewState('generating');
      setGenerating(true);
      setProgress(0);
      
      // Store product data
      setProductData(formData);
      
      // Get selected markets from store
      const selectedMarkets = useAppStore.getState().selectedMarkets;
      
      // Transform data for backend - ensure all required fields exist
      const backendData = {
        name: formData?.name || formData?.productName || 'Unknown Product',
        ingredients: Array.isArray(formData?.ingredients) 
          ? formData.ingredients.join(', ') 
          : (formData?.ingredients || 'No ingredients specified'),
        markets: selectedMarkets, // Send multiple markets
        market: formData?.market || formData?.primaryMarket || selectedMarkets[0] || 'EU', // Keep single market for backward compatibility
        nutrition: formData?.nutrition || {
          energy: { per100g: { value: 0, unit: 'kcal' } }
        }
      };
      
      console.log('Transformed backendData:', backendData);
      console.log('JSON.stringify(backendData):', JSON.stringify(backendData));
      
      // Generate labels
      await generateMutation.mutateAsync(backendData);
      
    } catch (error) {
      console.error('Generation error:', error);
      setGenerating(false);
      setProgress(0);
    }
  };

  const handleGenerateNew = () => {
    resetForm(); // Reset only form data, keep labels
    setViewState('input');
  };

  const handleBackToInput = () => {
    setViewState('input');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏷️</div>
              <div>
                <h1 className="text-2xl font-bold">SmartLabel AI</h1>
                <p className="text-sm text-gray-400">Intelligent Label Generation</p>
              </div>
            </div>
            
            {viewState === 'results' && (
              <div className="flex gap-2">
                <button
                  onClick={handleBackToInput}
                  className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  ← Back to Input
                </button>
                <button
                  onClick={handleGenerateNew}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Generate New
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewState === 'input' && (
          <div className="max-w-6xl mx-auto">
            <EnhancedProductForm
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {viewState === 'generating' && (
          <div className="max-w-4xl mx-auto">
            <SimpleGenerationTrace />
          </div>
        )}

        {viewState === 'results' && (
          <div className="w-full">
            <EnhancedComparisonLayout onGenerateNew={handleGenerateNew} />
          </div>
        )}

        {/* Error display */}
        {generateMutation.error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-xl">❌</span>
              <div>
                <h4 className="font-semibold">Generation Failed</h4>
                <p className="text-sm">
                  {generateMutation.error?.message || 'An unknown error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>SmartLabel AI - Powered by Advanced AI Technology</p>
            <p className="text-sm mt-2">
              Generate compliant labels for multiple markets with intelligent automation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}