'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketSelector } from './market-selector';
import { IngredientsInput } from './ingredients-input';
import { NutritionInput } from './nutrition-input';
// import type { Market } from '@repo/shared';

type Market = 'US' | 'UK' | 'ES' | 'AO' | 'MO' | 'BR' | 'AE';

interface AdvancedProductFormProps {
  onSubmit: (data: any) => void;
  isGenerating: boolean;
}

export function AdvancedProductForm({ onSubmit, isGenerating }: AdvancedProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    ingredients: [] as string[],
    market: 'EU',
    nutrition: {
      energy: { per100g: { value: 0, unit: 'kcal' } },
      fat: { per100g: { value: 0, unit: 'g' } },
      saturatedFat: { per100g: { value: 0, unit: 'g' } },
      carbohydrates: { per100g: { value: 0, unit: 'g' } },
      sugars: { per100g: { value: 0, unit: 'g' } },
      protein: { per100g: { value: 0, unit: 'g' } },
      salt: { per100g: { value: 0, unit: 'g' } },
      fiber: { per100g: { value: 0, unit: 'g' } }
    }
  });

  const selectedMarkets = useAppStore(state => state.selectedMarkets);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a product name');
      return;
    }
    
    if (formData.ingredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }
    
    if (selectedMarkets.length === 0) {
      alert('Please select at least one market');
      return;
    }

    // Generate labels for each selected market
    const labelsData = selectedMarkets.map(market => ({
      ...formData,
      market,
      ingredients: formData.ingredients
    }));

    onSubmit(labelsData);
  };

  const handleMarketsChange = (markets: string[]) => {
    useAppStore.getState().setSelectedMarkets(markets as Market[]);
  };

  const handleIngredientsChange = (ingredients: string[]) => {
    setFormData(prev => ({ ...prev, ingredients }));
  };

  const handleNutritionChange = (nutrition: any) => {
    setFormData(prev => ({ ...prev, nutrition }));
  };

  const fillSampleData = () => {
    setFormData({
      name: 'Organic Whole Wheat Bread',
      ingredients: [
        'Whole wheat flour',
        'Water',
        'Sea salt',
        'Organic yeast',
        'Olive oil',
        'Honey',
        'Sesame seeds'
      ],
      market: 'EU',
      nutrition: {
        energy: { per100g: { value: 250, unit: 'kcal' } },
        fat: { per100g: { value: 3.5, unit: 'g' } },
        saturatedFat: { per100g: { value: 0.5, unit: 'g' } },
        carbohydrates: { per100g: { value: 45, unit: 'g' } },
        sugars: { per100g: { value: 2, unit: 'g' } },
        protein: { per100g: { value: 8, unit: 'g' } },
        salt: { per100g: { value: 1.2, unit: 'g' } },
        fiber: { per100g: { value: 6, unit: 'g' } }
      }
    });
    
    // Select all markets
    handleMarketsChange(['EU', 'BR', 'AO', 'MO', 'AE']);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            Smart Label Generator
          </h2>
          <p className="text-gray-400">
            Generate compliant labels for multiple markets with AI
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={fillSampleData}
          disabled={isGenerating}
        >
          Fill Sample Data
        </Button>
      </div>

      {/* Product name */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name..."
                className="mt-1"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market selection */}
      <MarketSelector onMarketsChange={handleMarketsChange} />

      {/* Ingredients */}
      <IngredientsInput
        ingredients={formData.ingredients}
        onChange={handleIngredientsChange}
      />

      {/* Nutrition */}
      <NutritionInput
        nutrition={formData.nutrition}
        onChange={handleNutritionChange}
      />

      {/* Submit button */}
      <div className="flex justify-center pt-6">
        <Button
          type="submit"
          size="lg"
          disabled={isGenerating || !formData.name.trim() || formData.ingredients.length === 0 || selectedMarkets.length === 0}
          className="px-8 py-3 text-lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Generating Labels...
            </>
          ) : (
            <>
              🚀 Generate Smart Labels
            </>
          )}
        </Button>
      </div>

      {/* Help text */}
      <div className="text-center text-sm text-gray-500">
        <p>💡 <strong>Tip:</strong> The AI will generate compliant labels for all selected markets automatically</p>
      </div>
    </form>
  );
}
