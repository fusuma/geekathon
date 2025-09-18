'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AdvancedGenerationTraceProps {
  className?: string;
}

export function AdvancedGenerationTrace({ className }: AdvancedGenerationTraceProps) {
  const isGenerating = useAppStore(state => state.isGenerating);
  const progress = useAppStore(state => state.generationProgress);
  const selectedMarkets = useAppStore(state => state.selectedMarkets);

  if (!isGenerating) return null;

  const getProgressMessage = (progress: number) => {
    if (progress < 20) return "Initializing AI engine...";
    if (progress < 40) return "Analyzing product data...";
    if (progress < 60) return "Processing market regulations...";
    if (progress < 80) return "Generating compliance labels...";
    if (progress < 95) return "Finalizing label details...";
    return "Almost ready...";
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 60) return "bg-yellow-500";
    if (progress < 90) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span>AI Generation in Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor(progress)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status message */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {getProgressMessage(progress)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Generating labels for {selectedMarkets.length} markets
          </p>
        </div>

        {/* Market progress */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">Market Progress</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedMarkets.map((market, index) => {
              const marketProgress = Math.min(100, Math.max(0, (progress - (index * 20)) * 1.2));
              const isCompleted = marketProgress >= 100;
              const isActive = marketProgress > 0 && marketProgress < 100;
              
              return (
                <div
                  key={market}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCompleted 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : isActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{market}</span>
                    <span className="text-xs text-gray-500">
                      {isCompleted ? '✅' : isActive ? '🔄' : '⏳'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, marketProgress)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generation steps */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">Generation Steps</h4>
          <div className="space-y-2">
            {[
              { step: "Data Validation", completed: progress > 10 },
              { step: "Market Analysis", completed: progress > 30 },
              { step: "Regulation Processing", completed: progress > 50 },
              { step: "Label Generation", completed: progress > 70 },
              { step: "Quality Check", completed: progress > 90 },
              { step: "Finalization", completed: progress >= 100 }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  item.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600'
                }`}>
                  {item.completed ? '✓' : index + 1}
                </div>
                <span className={`text-sm ${
                  item.completed 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500'
                }`}>
                  {item.step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated time */}
        <div className="text-center text-sm text-gray-500">
          <p>Estimated time remaining: {Math.max(0, Math.ceil((100 - progress) / 10))} seconds</p>
        </div>
      </CardContent>
    </Card>
  );
}
