'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { MARKET_CONFIG } from '@/lib/market-config';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle, AlertTriangle, Globe, Shield, FileText } from 'lucide-react';
// import type { Market } from '@repo/shared';

type Market = 'US' | 'UK' | 'ES' | 'AO' | 'MO' | 'BR' | 'AE';

interface MarketRule {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  required: boolean;
}

const MARKET_RULES: Record<string, MarketRule[]> = {
  US: [
    {
      id: 'allergens',
      title: 'Allergen Declaration',
      description: '8 major allergens must be declared',
      severity: 'error',
      required: true,
    },
    {
      id: 'nutrition',
      title: 'Nutrition Facts Panel',
      description: 'Mandatory per serving with %DV',
      severity: 'error',
      required: true,
    },
    {
      id: 'language',
      title: 'Language Requirements',
      description: 'English language required',
      severity: 'warning',
      required: true,
    },
  ],
  UK: [
    {
      id: 'allergens',
      title: 'Allergen Declaration',
      description: '14 major allergens must be highlighted in bold or CAPS',
      severity: 'error',
      required: true,
    },
    {
      id: 'nutrition',
      title: 'Nutritional Values',
      description: 'Mandatory per 100g/ml with specific format',
      severity: 'error',
      required: true,
    },
    {
      id: 'language',
      title: 'Language Requirements',
      description: 'English language required',
      severity: 'warning',
      required: true,
    },
  ],
  ES: [
    {
      id: 'allergens',
      title: 'Allergen Declaration',
      description: '14 major allergens must be highlighted in bold or CAPS',
      severity: 'error',
      required: true,
    },
    {
      id: 'nutrition',
      title: 'Nutritional Values',
      description: 'Mandatory per 100g/ml with specific format',
      severity: 'error',
      required: true,
    },
    {
      id: 'language',
      title: 'Language Requirements',
      description: 'Spanish language required',
      severity: 'warning',
      required: true,
    },
  ],
  BR: [
    {
      id: 'front-pack',
      title: 'Front-of-Pack Warning',
      description: 'High sugar, fat, or sodium products require warning labels',
      severity: 'error',
      required: true,
    },
    {
      id: 'portion',
      title: 'Portion Information',
      description: 'Nutritional values per portion and per 100g',
      severity: 'warning',
      required: true,
    },
  ],
  AO: [
    {
      id: 'portuguese',
      title: 'Portuguese Language',
      description: 'All information must be in Portuguese',
      severity: 'error',
      required: true,
    },
    {
      id: 'basic-nutrition',
      title: 'Basic Nutrition',
      description: 'Energy, protein, carbs, fat, and fiber required',
      severity: 'warning',
      required: true,
    },
  ],
  MO: [
    {
      id: 'bilingual',
      title: 'Bilingual Requirements',
      description: 'Chinese and Portuguese languages required',
      severity: 'error',
      required: true,
    },
    {
      id: 'gb-standards',
      title: 'GB Standards',
      description: 'Must comply with Chinese GB standards',
      severity: 'warning',
      required: true,
    },
  ],
  AE: [
    {
      id: 'halal',
      title: 'Halal Certification',
      description: 'Products must be Halal certified',
      severity: 'error',
      required: true,
    },
    {
      id: 'arabic',
      title: 'Arabic Language',
      description: 'All information must be in Arabic',
      severity: 'error',
      required: true,
    },
  ],
};

export function AdvancedMarketSelector() {
  const { selectedMarkets, setSelectedMarkets, setPrimaryMarket, primaryMarket } = useAppStore();
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after client hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMarketChange = useCallback((market: Market, isChecked: boolean) => {
    let newSelectedMarkets: Market[];
    if (isChecked) {
      newSelectedMarkets = [...selectedMarkets, market];
      // If this is the first market being selected, automatically set it as primary
      if (selectedMarkets.length === 0) {
        setPrimaryMarket(market);
      }
    } else {
      newSelectedMarkets = selectedMarkets.filter((m) => m !== market);
      // If the deselected market was the primary market, set a new primary
      if (primaryMarket === market && newSelectedMarkets.length > 0) {
        setPrimaryMarket(newSelectedMarkets[0] || null);
      }
    }
    setSelectedMarkets(newSelectedMarkets);

    // If no markets are selected, reset primary market
    if (newSelectedMarkets.length === 0) {
      setPrimaryMarket(null);
    }
  }, [selectedMarkets, primaryMarket, setSelectedMarkets, setPrimaryMarket]);

  const handlePrimaryMarketChange = useCallback((market: Market) => {
    setPrimaryMarket(market);
  }, [setPrimaryMarket]);

  const toggleMarketExpansion = useCallback((market: string) => {
    setExpandedMarket(expandedMarket === market ? null : market);
  }, [expandedMarket]);

  const getRuleIcon = (severity: MarketRule['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRuleColor = (severity: MarketRule['severity']) => {
    switch (severity) {
      case 'error':
        return 'border-red-500 bg-red-50 text-red-900';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-900';
      case 'info':
        return 'border-blue-500 bg-blue-50 text-blue-900';
    }
  };

  // Show loading state during hydration to prevent mismatch
  if (!mounted) {
    return (
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Target Markets & Regulations
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Select markets to generate compliant labels. Each market has specific regulatory requirements.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-gray-400">Loading markets...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Target Markets & Regulations
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Select markets to generate compliant labels. Each market has specific regulatory requirements.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(MARKET_CONFIG).map(([marketKey, marketInfo]) => {
            const isSelected = selectedMarkets.includes(marketKey as Market);
            const isPrimary = primaryMarket === marketKey;
            const isExpanded = expandedMarket === marketKey;
            const rules = MARKET_RULES[marketKey] || [];

            return (
              <Card
                key={marketKey}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                } ${isPrimary ? 'ring-2 ring-blue-400' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          handleMarketChange(marketKey as Market, checked as boolean);
                        }}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <CardTitle className="text-lg">{marketInfo.label}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {marketInfo.language}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rules.length} rules
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMarketExpansion(marketKey);
                      }}
                      className="p-1 h-8 w-8"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          Key Requirements
                        </h4>
                        <div className="space-y-2">
                          {rules.slice(0, 2).map((rule) => (
                            <div
                              key={rule.id}
                              className={`p-2 rounded border-l-4 ${getRuleColor(rule.severity)}`}
                            >
                              <div className="flex items-center gap-2">
                                {getRuleIcon(rule.severity)}
                                <span className="text-xs font-medium">{rule.title}</span>
                              </div>
                              <p className="text-xs mt-1 opacity-90">{rule.description}</p>
                            </div>
                          ))}
                          {rules.length > 2 && (
                            <p className="text-xs text-gray-400">
                              +{rules.length - 2} more requirements
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Regulations
                        </h4>
                        <div className="space-y-1">
                          {marketInfo.requirements.map((req, index) => (
                            <p key={index} className="text-xs text-gray-400">
                              • {req}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}

                {isSelected && (
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`primary-market-${marketKey}`}
                        name="primary-market"
                        value={marketKey}
                        checked={isPrimary}
                        onChange={() => handlePrimaryMarketChange(marketKey as Market)}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Label
                        htmlFor={`primary-market-${marketKey}`}
                        className="text-xs text-gray-400 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Set as Primary Market
                      </Label>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Selected Markets Summary */}
        {selectedMarkets.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Selected Markets ({selectedMarkets.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedMarkets.map((market) => {
                const marketInfo = MARKET_CONFIG[market as keyof typeof MARKET_CONFIG];
                const isPrimary = primaryMarket === market;
                return (
                  <Badge
                    key={market}
                    variant={isPrimary ? 'default' : 'secondary'}
                    className={`flex items-center gap-1 ${
                      isPrimary
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-gray-200'
                    }`}
                  >
                    {marketInfo?.label || market}
                    {isPrimary && ' (Primary)'}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Compliance Alert */}
        {selectedMarkets.length > 0 && (
          <Alert className="bg-blue-900/20 border-blue-500">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-200">
              <strong>Compliance Note:</strong> Each selected market has specific regulatory requirements. 
              The AI will generate labels that comply with all selected market regulations.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}