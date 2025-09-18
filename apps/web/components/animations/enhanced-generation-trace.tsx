'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { MARKET_CONFIG } from '@/lib/market-config';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Loader2, 
  XCircle, 
  Globe, 
  Shield, 
  FileText, 
  Languages,
  Zap,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EnhancedGenerationTraceProps {
  className?: string;
}

const generationSteps = [
  {
    id: 'analyze',
    title: 'Analyzing Product Data',
    description: 'Processing ingredients, nutrition, and market requirements',
    icon: FileText,
    duration: 2000,
  },
  {
    id: 'regulations',
    title: 'Identifying Market Regulations',
    description: 'Matching product to specific regulatory requirements',
    icon: Shield,
    duration: 1500,
  },
  {
    id: 'generate',
    title: 'Generating Core Label Content',
    description: 'Creating compliant label text and formatting',
    icon: Zap,
    duration: 3000,
  },
  {
    id: 'compliance',
    title: 'Checking Compliance & Warnings',
    description: 'Validating against market-specific regulations',
    icon: Target,
    duration: 2000,
  },
  {
    id: 'translate',
    title: 'Translating & Localizing',
    description: 'Adapting content for target market languages',
    icon: Languages,
    duration: 2500,
  },
  {
    id: 'finalize',
    title: 'Finalizing Labels',
    description: 'Applying final formatting and quality checks',
    icon: Sparkles,
    duration: 1500,
  },
];

export function EnhancedGenerationTrace({ className }: EnhancedGenerationTraceProps) {
  const { isGenerating, generationProgress, selectedMarkets, labels } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [marketProgress, setMarketProgress] = useState<Record<string, number>>({});
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(true);

  // Calculate estimated time based on selected markets
  useEffect(() => {
    if (isGenerating) {
      const baseTime = generationSteps.reduce((acc, step) => acc + step.duration, 0);
      const marketMultiplier = Math.max(1, selectedMarkets.length * 0.5);
      setEstimatedTime(Math.ceil((baseTime * marketMultiplier) / 1000));
    }
  }, [isGenerating, selectedMarkets.length]);

  // Countdown timer
  useEffect(() => {
    if (isGenerating && estimatedTime > 0) {
      const interval = setInterval(() => {
        setEstimatedTime(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isGenerating, estimatedTime]);

  // Step progression
  useEffect(() => {
    if (isGenerating) {
      const stepDuration = 100 / generationSteps.length;
      const newCurrentStep = Math.floor(generationProgress / stepDuration);
      setCurrentStep(newCurrentStep);

      // Calculate step progress within current step
      const stepStart = newCurrentStep * stepDuration;
      const stepEnd = (newCurrentStep + 1) * stepDuration;
      const stepProgressValue = Math.max(0, Math.min(100, 
        ((generationProgress - stepStart) / (stepEnd - stepStart)) * 100
      ));
      setStepProgress(stepProgressValue);

      // Mark completed steps
      if (newCurrentStep > 0) {
        const newCompletedSteps = new Set<string>();
        for (let i = 0; i < newCurrentStep; i++) {
          const step = generationSteps[i];
          if (step) {
            newCompletedSteps.add(step.id);
          }
        }
        setCompletedSteps(newCompletedSteps);
      }
    } else {
      setCurrentStep(generationSteps.length - 1);
      setStepProgress(100);
      setCompletedSteps(new Set(generationSteps.map(step => step.id)));
    }
  }, [isGenerating, generationProgress]);

  // Market-specific progress simulation
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setMarketProgress(prev => {
          const newProgress = { ...prev };
          selectedMarkets.forEach(market => {
            if (!newProgress[market] || newProgress[market] < 100) {
              newProgress[market] = Math.min(100, (newProgress[market] || 0) + Math.random() * 15);
            }
          });
          return newProgress;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setMarketProgress({});
    }
  }, [isGenerating, selectedMarkets]);

  if (!isGenerating && labels.length === 0) return null;

  const currentStepData = generationSteps[currentStep];
  const isCompleted = !isGenerating && labels.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-lg shadow-lg bg-gray-800 border border-gray-700 ${className}`}
    >
      {/* Header */}
      <CardHeader className="text-center pb-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CardTitle className="text-3xl font-bold text-gray-100 mb-2 flex items-center justify-center gap-3">
            {isCompleted ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            )}
            AI SmartLabel Generation
          </CardTitle>
          <p className="text-gray-400">
            {isCompleted 
              ? 'Labels generated successfully!' 
              : 'Creating compliant labels for your product...'
            }
          </p>
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Overall Progress</span>
            <span className="text-sm text-gray-400">{Math.round(generationProgress)}%</span>
          </div>
          <Progress 
            value={generationProgress} 
            className="h-3 bg-gray-700"
          />
        </div>

        {/* Current Step */}
        {currentStepData && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-700 rounded-lg p-4 border border-gray-600"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : completedSteps.has(currentStepData.id) ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-100">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {currentStepData.description}
                </p>
              </div>
            </div>
            
            {!isCompleted && !completedSteps.has(currentStepData.id) && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Step Progress</span>
                  <span className="text-xs text-gray-400">{Math.round(stepProgress)}%</span>
                </div>
                <Progress 
                  value={stepProgress} 
                  className="h-2 bg-gray-600"
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Steps Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-100">Generation Steps</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {generationSteps.map((step, index) => {
                  const isStepCompleted = completedSteps.has(step.id);
                  const isStepCurrent = index === currentStep && !isStepCompleted;
                  const isStepPending = index > currentStep;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        isStepCompleted 
                          ? 'bg-green-900/20 border border-green-500/30' 
                          : isStepCurrent
                          ? 'bg-blue-900/20 border border-blue-500/30'
                          : 'bg-gray-700/50 border border-gray-600/30'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isStepCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : isStepCurrent ? (
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          isStepCompleted 
                            ? 'text-green-300' 
                            : isStepCurrent
                            ? 'text-blue-300'
                            : 'text-gray-400'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {step.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge 
                          variant={isStepCompleted ? 'default' : 'secondary'}
                          className={`text-xs ${
                            isStepCompleted 
                              ? 'bg-green-600 text-white' 
                              : isStepCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          {isStepCompleted ? 'Complete' : isStepCurrent ? 'In Progress' : 'Pending'}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Market-Specific Progress */}
        {selectedMarkets.length > 1 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Market-Specific Progress
            </h3>
            <div className="space-y-3">
              {selectedMarkets.map(market => {
                const marketInfo = MARKET_CONFIG[market as keyof typeof MARKET_CONFIG];
                const progress = marketProgress[market] || 0;
                const isComplete = progress >= 100;

                return (
                  <motion.div
                    key={market}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        {marketInfo?.label || market}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
                        {isComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2 bg-gray-700"
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Estimation */}
        {isGenerating && estimatedTime > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-blue-200">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Estimated time remaining: {estimatedTime} seconds
              </span>
            </div>
          </motion.div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center"
          >
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-300 mb-1">
              Generation Complete!
            </h3>
            <p className="text-sm text-green-200">
              {labels.length} label{labels.length !== 1 ? 's' : ''} generated for {selectedMarkets.length} market{selectedMarkets.length !== 1 ? 's' : ''}
            </p>
          </motion.div>
        )}
      </CardContent>
    </motion.div>
  );
}