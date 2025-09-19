'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translateIngredientsFromSource, detectLanguage, formatIngredientsForMarket } from '@/lib/translation';
import { Globe, Languages } from 'lucide-react';

interface IngredientsInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

export function IngredientsInput({ ingredients = [], onChange }: IngredientsInputProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('EN');
  const [showTranslation, setShowTranslation] = useState(false);
  
  const { selectedMarkets, primaryMarket } = useAppStore();

  // Detect language when ingredients change
  useEffect(() => {
    if (ingredients.length > 0) {
      const allIngredients = ingredients.join(' ');
      const detected = detectLanguage(allIngredients);
      setDetectedLanguage(detected);
    }
  }, [ingredients]);

  // Get translated ingredients for each market
  const getTranslatedIngredients = (market: string) => {
    if (ingredients.length === 0) return [];
    return translateIngredientsFromSource(ingredients, detectedLanguage, market);
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      onChange([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    onChange(ingredients.filter(ing => ing !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedIngredients = pastedText
      .split(/[,\n;]/)
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);
    
    const uniqueIngredients = [...new Set([...ingredients, ...pastedIngredients])];
    onChange(uniqueIngredients);
  };

  const fillSampleIngredients = () => {
    const sampleIngredients = [
      'Whole wheat flour',
      'Water',
      'Sea salt',
      'Organic yeast',
      'Olive oil',
      'Honey',
      'Sesame seeds'
    ];
    onChange(sampleIngredients);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Ingredients List</span>
            {ingredients.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Languages className="h-3 w-3 mr-1" />
                {detectedLanguage}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillSampleIngredients}
            >
              Sample Data
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={ingredients.length === 0}
            >
              Clear All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTranslation(!showTranslation)}
              disabled={ingredients.length === 0}
            >
              <Globe className="h-4 w-4 mr-1" />
              {showTranslation ? 'Hide' : 'Show'} Translation
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add ingredient input */}
          <div className="flex gap-2">
            <Input
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Enter ingredient name..."
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddIngredient}
              disabled={!newIngredient.trim()}
            >
              Add
            </Button>
          </div>

          {/* Ingredients list */}
          {ingredients.length > 0 && (
            <div className="space-y-2">
              <Label>Ingredients ({ingredients.length})</Label>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <Badge
                    key={`${ingredient}-${index}`}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <span>{ingredient}</span>
                    <button
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-1 hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Translation preview */}
          {showTranslation && ingredients.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Translation Preview
              </h4>
              <div className="space-y-3">
                {selectedMarkets.map(market => {
                  const translatedIngredients = getTranslatedIngredients(market);
                  const isDifferent = JSON.stringify(ingredients) !== JSON.stringify(translatedIngredients);
                  
                  return (
                    <div key={market} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{market} Market</h5>
                        {isDifferent && (
                          <Badge variant="secondary" className="text-xs">
                            Translated
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {formatIngredientsForMarket(translatedIngredients, market)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                💡 Ingredients are automatically translated based on the selected markets and detected language.
              </div>
            </div>
          )}

          {/* Advanced options */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Advanced Options</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ingredientOrder">Ingredient Order</Label>
                  <select
                    id="ingredientOrder"
                    className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <option value="descending">Descending (most to least)</option>
                    <option value="ascending">Ascending (least to most)</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="custom">Custom order</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="allergenHighlighting">Allergen Highlighting</Label>
                  <div className="mt-1 space-y-2">
                    <label className="flex items-center text-gray-100">
                      <input type="checkbox" className="mr-2 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                      Highlight common allergens
                    </label>
                    <label className="flex items-center text-gray-100">
                      <input type="checkbox" className="mr-2 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                      Bold allergen names
                    </label>
                    <label className="flex items-center text-gray-100">
                      <input type="checkbox" className="mr-2 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                      Add allergen warnings
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="language">Display Language</Label>
                  <select
                    id="language"
                    className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="pt">Portuguese</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ar">Arabic</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Help text */}
          <div className="text-sm text-gray-500">
            <p>💡 <strong>Tips:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>You can paste multiple ingredients separated by commas, semicolons, or new lines</li>
              <li>Ingredients will be automatically ordered by quantity (descending)</li>
              <li>Common allergens will be highlighted automatically</li>
              <li>Use specific names (e.g., "Whole wheat flour" instead of "flour")</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
