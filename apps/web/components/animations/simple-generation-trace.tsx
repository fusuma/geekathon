'use client';

import { useAppStore } from '@/stores/app-store';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, Globe, Shield, FileText } from 'lucide-react';

export function SimpleGenerationTrace() {
  const { isGenerating, generationProgress, selectedMarkets } = useAppStore();

  const generationSteps = [
    { id: 'analyze', label: 'Analyzing Product Data', icon: FileText },
    { id: 'compliance', label: 'Checking Compliance Rules', icon: Shield },
    { id: 'translate', label: 'Translating Content', icon: Globe },
    { id: 'generate', label: 'Generating Labels', icon: CheckCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <h2 className="text-2xl font-bold text-white">Generating Smart Labels</h2>
        </div>
        <p className="text-gray-400">
          Creating compliant labels for {selectedMarkets.length} market{selectedMarkets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(generationProgress)}%</span>
        </div>
        <Progress value={generationProgress} className="h-3" />
      </div>

      {/* Generation Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {generationSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = generationProgress > (index * 25);
          const isCompleted = generationProgress > ((index + 1) * 25);

          return (
            <div
              key={step.id}
              className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                isCompleted
                  ? 'border-green-500 bg-green-500/10'
                  : isActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : isActive ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{step.label}</h3>
                  <p className="text-sm text-gray-400">
                    {isCompleted
                      ? 'Completed'
                      : isActive
                      ? 'In Progress...'
                      : 'Waiting...'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Market Progress */}
      {selectedMarkets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Market Progress</h3>
          <div className="space-y-3">
            {selectedMarkets.map((market) => (
              <div key={market} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-400">{market}</div>
                <div className="flex-1">
                  <Progress value={generationProgress} className="h-2" />
                </div>
                <div className="w-12 text-sm text-gray-400 text-right">
                  {Math.round(generationProgress)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}