'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LabelDisplay } from '@/components/label-display';
import { cn } from '@/lib/utils';
import { useAppStore, useSelectedMarkets, useLabels } from '@/stores/app-store';
import { MARKET_CONFIG } from '@/stores/app-store';
import type { Market } from '@repo/shared';

interface SideBySideLayoutProps {
  onGenerateNew: () => void;
  className?: string;
}

export function SideBySideLayout({ onGenerateNew, className }: SideBySideLayoutProps) {
  const selectedMarkets = useSelectedMarkets();
  const labels = useLabels();
  const [activeMarketIndex, setActiveMarketIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out markets that don't have labels generated
  const marketsWithLabels = selectedMarkets.filter(market => labels[market]);

  if (marketsWithLabels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No labels generated yet</p>
      </div>
    );
  }

  // Single market view
  if (marketsWithLabels.length === 1) {
    const market = marketsWithLabels[0];
    if (!market) return null;
    const label = labels[market];
    return label ? (
      <div className={cn('w-full', className)}>
        <LabelDisplay
          label={label}
          onGenerateNew={onGenerateNew}
          showMarketHeader={true}
        />
      </div>
    ) : null;
  }

  // Mobile view (stacked with swipe navigation)
  const MobileView = () => {
    const currentMarket = marketsWithLabels[activeMarketIndex];
    if (!currentMarket) return null;
    const currentLabel = labels[currentMarket];

    return (
      <div className="lg:hidden">
        {/* Mobile Market Navigator */}
        <div className="flex items-center justify-between mb-4 bg-gray-700 rounded-lg p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveMarketIndex(Math.max(0, activeMarketIndex - 1))}
            disabled={activeMarketIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div className="text-lg font-medium text-gray-100">
              {MARKET_CONFIG[currentMarket]?.flag} {MARKET_CONFIG[currentMarket]?.name}
            </div>
            <div className="text-sm text-gray-400">
              {activeMarketIndex + 1} of {marketsWithLabels.length}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveMarketIndex(Math.min(marketsWithLabels.length - 1, activeMarketIndex + 1))}
            disabled={activeMarketIndex === marketsWithLabels.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Label Display */}
        {currentLabel && (
          <LabelDisplay
            label={currentLabel}
            onGenerateNew={onGenerateNew}
            showMarketHeader={false}
          />
        )}
      </div>
    );
  };

  // Desktop view (side-by-side)
  const DesktopView = () => {
    return (
      <div className="hidden lg:block">
        {/* Desktop Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Market Comparison</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Compact View
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Expanded View
                </>
              )}
            </Button>
            <Button onClick={onGenerateNew}>
              Generate New Labels
            </Button>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className={cn(
          'grid gap-6',
          marketsWithLabels.length === 2 && 'grid-cols-2',
          marketsWithLabels.length === 3 && 'grid-cols-3',
          marketsWithLabels.length >= 4 && 'grid-cols-2 xl:grid-cols-4',
          isExpanded && 'grid-cols-1 space-y-6'
        )}>
          {marketsWithLabels.map((market) => {
            const label = labels[market];
            return label ? (
              <div
                key={market}
                className={cn(
                  'bg-gray-800 rounded-lg border border-gray-700 p-6',
                  isExpanded && 'max-w-4xl mx-auto'
                )}
              >
                <LabelDisplay
                  label={label}
                  onGenerateNew={onGenerateNew}
                  showMarketHeader={true}
                />
              </div>
            ) : (
              <div
                key={market}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6"
              >
                <div className="text-center text-gray-400">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{MARKET_CONFIG[market].flag}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{MARKET_CONFIG[market].name}</h3>
                      <p className="text-sm text-gray-400">{MARKET_CONFIG[market].description}</p>
                    </div>
                  </div>
                  <p>No label generated for this market</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      <MobileView />
      <DesktopView />
    </div>
  );
}

// Enhanced comparison component with synchronization
export function SynchronizedComparisonLayout({ onGenerateNew, className }: SideBySideLayoutProps) {
  const selectedMarkets = useSelectedMarkets();
  const labels = useLabels();
  const [syncScroll, setSyncScroll] = useState(true);
  const [focusedSection, setFocusedSection] = useState<string | null>(null);

  const marketsWithLabels = selectedMarkets.filter(market => labels[market]);

  if (marketsWithLabels.length < 2) {
    return (
      <SideBySideLayout onGenerateNew={onGenerateNew} className={className} />
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Synchronization Controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Synchronized Comparison</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
              className="rounded"
            />
            Sync Scrolling
          </label>
          <Button onClick={onGenerateNew}>
            Generate New Labels
          </Button>
        </div>
      </div>

      {/* Synchronized Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {marketsWithLabels.map((market) => {
          const label = labels[market];
          return label ? (
            <div
              key={market}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
              onMouseEnter={() => setFocusedSection(market)}
              onMouseLeave={() => setFocusedSection(null)}
            >
              <LabelDisplay
                label={label}
                onGenerateNew={onGenerateNew}
                showMarketHeader={true}
              />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}