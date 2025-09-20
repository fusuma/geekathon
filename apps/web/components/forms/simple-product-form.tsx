'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MARKETS = [
  { value: 'EU', label: 'European Union (Spain)' },
  { value: 'BR', label: 'Brazil' },
  { value: 'AO', label: 'Angola' },
  { value: 'MO', label: 'Macau' },
  { value: 'AE', label: 'UAE (Halal)' },
];

interface SimpleProductFormProps {
  onSubmit: (data: any) => void;
  isGenerating: boolean;
}

export function SimpleProductForm({ onSubmit, isGenerating }: SimpleProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    ingredients: '',
    market: 'EU',
    nutrition: {
      energy: { per100g: { value: 0, unit: 'kcal' } },
      fat: { per100g: { value: 0, unit: 'g' } },
      saturatedFat: { per100g: { value: 0, unit: 'g' } },
      carbohydrates: { per100g: { value: 0, unit: 'g' } },
      sugars: { per100g: { value: 0, unit: 'g' } },
      protein: { per100g: { value: 0, unit: 'g' } },
      salt: { per100g: { value: 0, unit: 'g' } },
      fiber: { per100g: { value: 0, unit: 'g' } },
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      ingredients: formData.ingredients.split(',').map(ing => ing.trim()).filter(Boolean),
    };
    
    onSubmit(productData);
  };

  const handleNutritionChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: {
          per100g: {
            value: value,
            unit: prev.nutrition[field as keyof typeof prev.nutrition].per100g.unit
          }
        }
      }
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-100">
          SmartLabel AI - Product Information
        </CardTitle>
        <p className="text-gray-400">
          Enter your product details to generate compliant labels for multiple markets
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Insert Product Name"
              required
              className="bg-gray-800 border-gray-600 text-gray-100"
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <Label htmlFor="ingredients" className="text-gray-200">Ingredients (comma-separated)</Label>
            <Input
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              placeholder="e.g., Whole wheat flour, water, sea salt, yeast"
              required
              className="bg-gray-800 border-gray-600 text-gray-100"
            />
          </div>

          {/* Market Selection */}
          <div className="space-y-2">
            <Label className="text-gray-200">Target Market</Label>
            <select
              value={formData.market}
              onChange={(e) => setFormData(prev => ({ ...prev, market: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MARKETS.map((market) => (
                <option key={market.value} value={market.value}>
                  {market.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nutritional Information */}
          <div className="space-y-4">
            <Label className="text-gray-200">Nutritional Information (per 100g)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="energy" className="text-sm text-gray-300">Energy (kcal)</Label>
                <Input
                  id="energy"
                  type="number"
                  value={formData.nutrition.energy.per100g.value}
                  onChange={(e) => handleNutritionChange('energy', Number(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat" className="text-sm text-gray-300">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={formData.nutrition.fat.per100g.value}
                  onChange={(e) => handleNutritionChange('fat', Number(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-sm text-gray-300">Carbohydrates (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={formData.nutrition.carbohydrates.per100g.value}
                  onChange={(e) => handleNutritionChange('carbohydrates', Number(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-sm text-gray-300">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={formData.nutrition.protein.per100g.value}
                  onChange={(e) => handleNutritionChange('protein', Number(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGenerating ? 'Generating Labels...' : 'Generate Smart Labels'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}