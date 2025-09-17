'use client';

import { useState } from 'react';
import { Check, ChevronDown, Globe, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppStore, MARKET_CONFIG } from '@/stores/app-store';
import type { Market, Language } from '@repo/shared';

interface MarketSelectorProps {
  className?: string;
  variant?: 'single' | 'multi' | 'comparison';
}

export function MarketSelector({ className, variant = 'single' }: MarketSelectorProps) {
  const {
    selectedMarkets,
    primaryMarket,
    comparisonMode,
    language,
    setSelectedMarkets,
    setPrimaryMarket,
    toggleComparisonMode,
    setLanguage,
  } = useAppStore();

  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const handleMarketToggle = (market: Market) => {
    if (variant === 'single') {
      setPrimaryMarket(market);
      setSelectedMarkets([market]);
    } else {
      const isSelected = selectedMarkets.includes(market);
      if (isSelected && selectedMarkets.length > 1) {
        // Remove market if it's selected and we have more than one
        const newMarkets = selectedMarkets.filter(m => m !== market);
        setSelectedMarkets(newMarkets);
        // Update primary market if needed
        if (primaryMarket === market && newMarkets.length > 0) {
          setPrimaryMarket(newMarkets[0]!);
        }
      } else if (!isSelected) {
        // Add market
        setSelectedMarkets([...selectedMarkets, market]);
        // Set as primary if it's the first one
        if (selectedMarkets.length === 0) {
          setPrimaryMarket(market);
        }
      }
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsLanguageOpen(false);
  };

  const getPrimaryMarketInfo = () => MARKET_CONFIG[primaryMarket];
  const getSelectedMarketsInfo = () => selectedMarkets.map(m => MARKET_CONFIG[m]);

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'pt' as Language, name: 'Português', flag: '🇵🇹' },
    { code: 'pt-BR' as Language, name: 'Português (BR)', flag: '🇧🇷' },
  ];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Market Selection */}
      <DropdownMenu open={isMarketOpen} onOpenChange={setIsMarketOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[180px] justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {variant === 'single' ? (
                <span>
                  {getPrimaryMarketInfo().flag} {getPrimaryMarketInfo().name}
                </span>
              ) : (
                <span>
                  {selectedMarkets.length === 1
                    ? `${getPrimaryMarketInfo().flag} ${getPrimaryMarketInfo().name}`
                    : `${selectedMarkets.length} Markets`
                  }
                </span>
              )}
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Select Markets</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {Object.entries(MARKET_CONFIG).map(([code, config]) => {
            const market = code as Market;
            const isSelected = selectedMarkets.includes(market);
            const isPrimary = primaryMarket === market;

            return variant === 'single' ? (
              <DropdownMenuItem
                key={market}
                onClick={() => handleMarketToggle(market)}
                className="flex items-center gap-2"
              >
                <span className="text-lg">{config.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{config.name}</div>
                  <div className="text-xs text-muted-foreground">{config.description}</div>
                </div>
                {isPrimary && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuCheckboxItem
                key={market}
                checked={isSelected}
                onCheckedChange={() => handleMarketToggle(market)}
                className="flex items-center gap-2"
              >
                <span className="text-lg">{config.flag}</span>
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-1">
                    {config.name}
                    {isPrimary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{config.description}</div>
                </div>
              </DropdownMenuCheckboxItem>
            );
          })}

          {variant !== 'single' && selectedMarkets.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={toggleComparisonMode}
                className="flex items-center gap-2"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {comparisonMode ? 'Disable' : 'Enable'} Comparison View
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Side-by-side market comparison
                  </div>
                </div>
                {comparisonMode && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language Selection */}
      <DropdownMenu open={isLanguageOpen} onOpenChange={setIsLanguageOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Languages className="w-4 h-4 mr-1" />
            {languages.find(l => l.code === language)?.flag}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center gap-2"
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && <Check className="w-4 h-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected Markets Display (for multi mode) */}
      {variant !== 'single' && selectedMarkets.length > 1 && (
        <div className="flex items-center gap-1 flex-wrap">
          {getSelectedMarketsInfo().map((config, index) => {
            const market = selectedMarkets[index];
            return (
              <Badge
                key={market}
                variant={market === primaryMarket ? "default" : "secondary"}
                className="text-xs"
              >
                {config.flag} {config.name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Specialized components for different use cases
export function SingleMarketSelector({ className }: { className?: string }) {
  return <MarketSelector variant="single" className={className} />;
}

export function MultiMarketSelector({ className }: { className?: string }) {
  return <MarketSelector variant="multi" className={className} />;
}

export function ComparisonMarketSelector({ className }: { className?: string }) {
  return <MarketSelector variant="comparison" className={className} />;
}