'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Cpu,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppStore, useGenerationState, MARKET_CONFIG } from '@/stores/app-store';
import type { GenerationStep } from '@/stores/app-store';

interface EnhancedGenerationTraceProps {
  className?: string;
}

const stepIcons = {
  analyzing: Search,
  regulations: BookOpen,
  generating: Cpu,
  validating: Shield,
} as const;

const stepDescriptions = {
  analyzing: 'Analyzing product ingredients and nutritional data',
  regulations: 'Researching market-specific regulations and requirements',
  generating: 'Generating compliant label content using AI',
  validating: 'Validating compliance and formatting output',
} as const;

function AnimatedStep({
  step,
  isActive,
  isCompleted,
  delay = 0
}: {
  step: GenerationStep;
  isActive: boolean;
  isCompleted: boolean;
  delay?: number;
}) {
  const IconComponent = stepIcons[step.id as keyof typeof stepIcons] || Cpu;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg"
    >
      {/* Step Icon */}
      <div className={`
        flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
        ${isCompleted
          ? 'bg-green-900/30 border-green-500 text-green-400'
          : isActive
          ? 'bg-blue-900/30 border-blue-500 text-blue-400 animate-pulse'
          : 'bg-gray-600 border-gray-500 text-gray-400'
        }
      `}>
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle className="w-6 h-6" />
          </motion.div>
        ) : isActive ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <IconComponent className="w-6 h-6" />
          </motion.div>
        ) : (
          <IconComponent className="w-6 h-6" />
        )}
      </div>

      {/* Step Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-100">{step.name}</h4>
          {isActive && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Processing
            </Badge>
          )}
          {isCompleted && step.duration && (
            <Badge variant="outline" className="text-xs text-green-400">
              <Clock className="w-3 h-3 mr-1" />
              {step.duration}ms
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400">
          {stepDescriptions[step.id as keyof typeof stepDescriptions] || 'Processing...'}
        </p>

        {/* Progress Bar for Active Step */}
        {isActive && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            className="mt-2"
          >
            <Progress value={65} className="h-1" />
          </motion.div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="text-right">
        {step.status === 'error' && (
          <AlertCircle className="w-5 h-5 text-red-400" />
        )}
      </div>
    </motion.div>
  );
}

function MarketProgressIndicator() {
  const { selectedMarkets, isGenerating } = useAppStore();
  const [currentMarketIndex, setCurrentMarketIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setCurrentMarketIndex(prev => (prev + 1) % selectedMarkets.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isGenerating, selectedMarkets.length]);

  if (selectedMarkets.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-700 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center gap-3 mb-3">
        <Globe className="w-5 h-5 text-blue-400" />
        <h3 className="font-medium text-gray-100">Multi-Market Generation</h3>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {selectedMarkets.map((market, index) => {
          const config = MARKET_CONFIG[market];
          const isActive = index === currentMarketIndex;
          const isCompleted = index < currentMarketIndex;

          return (
            <motion.div
              key={market}
              className={`
                flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300
                ${isCompleted
                  ? 'bg-green-900/20 border-green-600/30 text-green-400'
                  : isActive
                  ? 'bg-blue-900/20 border-blue-600/30 text-blue-400'
                  : 'bg-gray-600/20 border-gray-600/30 text-gray-400'
                }
              `}
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm">{config.flag}</span>
              <span className="text-xs">{config.name}</span>
              {isCompleted && <CheckCircle className="w-3 h-3" />}
              {isActive && <Zap className="w-3 h-3" />}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function EstimatedTimeRemaining() {
  const { selectedMarkets, generationProgress } = useAppStore();
  const [timeRemaining, setTimeRemaining] = useState(15);

  useEffect(() => {
    const completedSteps = generationProgress.filter(step => step.status === 'completed').length;
    const totalSteps = generationProgress.length;
    const baseTime = selectedMarkets.length * 3; // 3 seconds per market
    const remaining = Math.max(1, baseTime - (completedSteps / totalSteps) * baseTime);
    setTimeRemaining(Math.ceil(remaining));
  }, [generationProgress, selectedMarkets.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center text-gray-400 text-sm"
    >
      <Clock className="w-4 h-4 inline mr-1" />
      Estimated time remaining: ~{timeRemaining} seconds
    </motion.div>
  );
}

export function EnhancedGenerationTrace({ className }: EnhancedGenerationTraceProps) {
  const { isGenerating, progress } = useGenerationState();
  const [showDetails, setShowDetails] = useState(true);

  if (!isGenerating && progress.length === 0) {
    return null;
  }

  const currentStepIndex = progress.findIndex(step => step.status === 'in_progress');

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          AI Generation in Progress
        </h2>
        <p className="text-gray-400">
          Generating compliant labels using advanced AI technology
        </p>
      </motion.div>

      {/* Market Progress */}
      <MarketProgressIndicator />

      {/* Generation Steps */}
      <div className="space-y-4">
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
              className="space-y-3"
            >
              {progress.map((step, index) => (
                <AnimatedStep
                  key={step.id}
                  step={step}
                  isActive={step.status === 'in_progress'}
                  isCompleted={step.status === 'completed'}
                  delay={index * 0.1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Overall Progress</span>
          <span className="text-sm text-gray-400">
            {progress.filter(s => s.status === 'completed').length} / {progress.length} steps
          </span>
        </div>
        <Progress
          value={(progress.filter(s => s.status === 'completed').length / progress.length) * 100}
          className="h-2"
        />
      </motion.div>

      {/* Time Remaining */}
      <EstimatedTimeRemaining />

      {/* Animated Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.3,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + i * 30}%`,
              top: '50%',
            }}
          />
        ))}
      </div>
    </div>
  );
}