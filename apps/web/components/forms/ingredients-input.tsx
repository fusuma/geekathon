'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IngredientsInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

export function IngredientsInput({ ingredients = [], onChange }: IngredientsInputProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

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
          <span>Ingredients List</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fillSampleIngredients}
            >
              Sample Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={ingredients.length === 0}
            >
              Clear All
            </Button>
            <Button
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

          {/* Advanced options */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Advanced Options</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ingredientOrder">Ingredient Order</Label>
                  <select
                    id="ingredientOrder"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
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
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Highlight common allergens
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Bold allergen names
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Add allergen warnings
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="language">Display Language</Label>
                  <select
                    id="language"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
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
