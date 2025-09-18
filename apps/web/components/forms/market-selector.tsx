'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Market } from '@repo/shared';

const MARKETS = [
  {
    id: 'EU',
    name: 'European Union',
    flag: '🇪🇺',
    description: 'EU regulations (Spain)',
    languages: ['EN', 'ES', 'FR', 'DE'],
    requirements: ['Nutrition table', 'Allergen warnings', 'Origin labeling']
  },
  {
    id: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    description: 'ANVISA regulations',
    languages: ['PT-BR'],
    requirements: ['Nutrition table', 'Allergen warnings', 'Brazilian standards']
  },
  {
    id: 'AO',
    name: 'Angola',
    flag: '🇦🇴',
    description: 'Angolan regulations',
    languages: ['PT-AO'],
    requirements: ['Nutrition table', 'Local language', 'Angolan standards']
  },
  {
    id: 'MO',
    name: 'Macau',
    flag: '🇲🇴',
    description: 'Macau regulations',
    languages: ['PT-MO', 'ZH'],
    requirements: ['Nutrition table', 'Bilingual labeling', 'Macau standards']
  },
  {
    id: 'AE',
    name: 'UAE (Halal)',
    flag: '🇦🇪',
    description: 'Halal certification required',
    languages: ['EN', 'AR'],
    requirements: ['Halal certification', 'Arabic labeling', 'UAE standards']
  }
];

interface MarketSelectorProps {
  onMarketsChange: (markets: string[]) => void;
}

export function MarketSelector({ onMarketsChange }: MarketSelectorProps) {
  const selectedMarkets = useAppStore(state => state.selectedMarkets);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleMarketToggle = (marketId: string) => {
    const newMarkets = selectedMarkets.includes(marketId as Market)
      ? selectedMarkets.filter(id => id !== marketId)
      : [...selectedMarkets, marketId as Market];
    
    onMarketsChange(newMarkets);
  };

  const handleSelectAll = () => {
    onMarketsChange(MARKETS.map(m => m.id as Market));
  };

  const handleClearAll = () => {
    onMarketsChange([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Target Markets</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedMarkets.length === MARKETS.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedMarkets.length === 0}
            >
              Clear All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MARKETS.map((market) => (
            <div
              key={market.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedMarkets.includes(market.id as Market)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleMarketToggle(market.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{market.flag}</span>
                  <div>
                    <h3 className="font-semibold">{market.name}</h3>
                    <p className="text-sm text-gray-600">{market.description}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedMarkets.includes(market.id as Market)}
                  onChange={() => handleMarketToggle(market.id)}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Languages:</p>
                  <div className="flex flex-wrap gap-1">
                    {market.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Requirements:</p>
                  <div className="flex flex-wrap gap-1">
                    {market.requirements.slice(0, 2).map((req) => (
                      <Badge key={req} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                    {market.requirements.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{market.requirements.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedMarkets.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Selected Markets ({selectedMarkets.length})</h4>
            <div className="flex flex-wrap gap-2">
              {selectedMarkets.map((marketId) => {
                const market = MARKETS.find(m => m.id === marketId);
                return (
                  <Badge key={marketId} variant="default" className="flex items-center gap-1">
                    <span>{market?.flag}</span>
                    <span>{market?.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarketToggle(marketId);
                      }}
                      className="ml-1 hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
