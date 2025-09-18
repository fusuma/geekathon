'use client';

import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdvancedComparisonLayoutProps {
  onGenerateNew: () => void;
}

const MARKET_INFO = {
  UK: { name: 'United Kingdom', flag: '🇬🇧', color: 'bg-blue-100 dark:bg-blue-900/20' },
  ES: { name: 'Spain', flag: '🇪🇸', color: 'bg-red-100 dark:bg-red-900/20' },
  BR: { name: 'Brazil', flag: '🇧🇷', color: 'bg-green-100 dark:bg-green-900/20' },
  AO: { name: 'Angola', flag: '🇦🇴', color: 'bg-red-100 dark:bg-red-900/20' },
  MO: { name: 'Macau', flag: '🇲🇴', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
  AE: { name: 'UAE (Halal)', flag: '🇦🇪', color: 'bg-purple-100 dark:bg-purple-900/20' }
};

export function AdvancedComparisonLayout({ onGenerateNew }: AdvancedComparisonLayoutProps) {
  const labels = useAppStore(state => state.labels);
  const selectedMarkets = useAppStore(state => state.selectedMarkets);
  const productData = useAppStore(state => state.productData);

  if (labels.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏷️</div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">No Labels Generated Yet</h2>
        <p className="text-gray-400 mb-6">Generate your first smart label to see the comparison view</p>
        <Button onClick={onGenerateNew} size="lg">
          Generate Smart Labels
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            Smart Label Comparison
          </h2>
          <p className="text-gray-400">
            Compare labels across {selectedMarkets.length} markets
          </p>
        </div>
        <Button onClick={onGenerateNew} size="lg">
          Generate New Labels
        </Button>
      </div>

      {/* Market tabs */}
      <Tabs defaultValue={selectedMarkets[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {selectedMarkets.map((market) => (
            <TabsTrigger key={market} value={market} className="flex items-center gap-2">
              <span>{MARKET_INFO[market as keyof typeof MARKET_INFO]?.flag}</span>
              <span className="hidden sm:inline">{market}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {selectedMarkets.map((market) => {
          const marketLabel = labels.find(label => label.market === market);
          const marketInfo = MARKET_INFO[market as keyof typeof MARKET_INFO];
          
          return (
            <TabsContent key={market} value={market} className="mt-6">
              <Card className={`${marketInfo?.color} border-2`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{marketInfo?.flag}</span>
                    <div>
                      <h3 className="text-xl">{marketInfo?.name} Label</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Generated for {productData?.name || 'Product'}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {marketLabel ? (
                    <div className="space-y-6">
                      {/* Product info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Product Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium">{(marketLabel as any).productName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Market:</span>
                              <Badge variant="outline">{marketLabel.market}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Language:</span>
                              <Badge variant="secondary">{marketLabel.language}</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Ingredients</h4>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-sm text-gray-500">{marketLabel.labelData.legalLabel.ingredients || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Nutritional info */}
                      <div>
                        <h4 className="font-semibold mb-2">Nutritional Information</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(marketLabel.labelData.legalLabel.nutrition).map(([key, value]) => (
                            <div key={key} className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">
                                {value?.per100g?.value || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Warnings and compliance */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Warnings</h4>
                          <div className="space-y-1">
                            {marketLabel.labelData.warnings?.map((warning, index) => (
                              <div key={index} className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                                ⚠️ {warning}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Compliance Notes</h4>
                          <div className="space-y-1">
                            {marketLabel.labelData.complianceNotes?.map((note, index) => (
                              <div key={index} className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                ✅ {note}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Allergens */}
                      {marketLabel.labelData.legalLabel.allergens && (
                        <div>
                          <h4 className="font-semibold mb-2">Allergens</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="destructive" className="text-xs">
                              🚨 {marketLabel.labelData.legalLabel.allergens}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Generated: {new Date().toLocaleString()}</span>
                          <span>Version: 1.0</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">❌</div>
                      <p className="text-gray-500">No label generated for {marketInfo?.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{labels.length}</div>
              <div className="text-sm text-gray-600">Labels Generated</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{selectedMarkets.length}</div>
              <div className="text-sm text-gray-600">Markets Covered</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(labels.map(l => l.language)).size}
              </div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
