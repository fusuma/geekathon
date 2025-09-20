'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Download, Eye, Loader2 } from 'lucide-react';

interface VisualLabelGeneratorProps {
  labelData: any;
  onClose?: () => void;
}

// Mock function to create a simple label image
function createMockLabelImage(labelData: any): string {
  // Create a simple canvas-based image representation
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Black border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  
  let y = 40;
  
  // Title
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Nutrition Facts', canvas.width / 2, y);
  y += 30;
  
  // Product name
  ctx.font = 'bold 16px Arial';
  ctx.fillText(labelData.nutrition_facts?.serving_size || 'Serving Size', canvas.width / 2, y);
  y += 25;
  
  // Serving info
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Serving Size: ${labelData.nutrition_facts?.serving_size || '100g'}`, 20, y);
  y += 20;
  ctx.fillText(`Servings per Container: ${labelData.nutrition_facts?.servings_per_container || '1'}`, 20, y);
  y += 30;
  
  // Calories
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`Calories: ${labelData.nutrition_facts?.calories || '0'}`, 20, y);
  y += 30;
  
  // Nutrients
  ctx.font = '14px Arial';
  if (labelData.nutrition_facts?.nutrients) {
    labelData.nutrition_facts.nutrients.forEach((nutrient: any) => {
      ctx.fillText(`${nutrient.name}: ${nutrient.amount} (${nutrient.daily_value})`, 20, y);
      y += 20;
    });
  }
  
  y += 20;
  ctx.fillText(`Ingredients: ${labelData.ingredients || 'Not specified'}`, 20, y);
  y += 20;
  ctx.fillText(`Allergens: ${labelData.allergens || 'None'}`, 20, y);
  
  return canvas.toDataURL('image/png');
}

export function VisualLabelGenerator({ labelData, onClose }: VisualLabelGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateVisualLabel = async () => {
    setGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
        // Use the new API service
        const { generateNutritionLabel } = await import('../src/services/api');
        
        const productData = {
          name: labelData.productName || 'Product',
          serving_size: labelData.servingSize || '1 serving',
          servings_per_container: labelData.servingsPerContainer || '1',
          calories: labelData.calories || '0',
          total_fat: labelData.nutritionalValues?.total_fat || '0g',
          protein: labelData.nutritionalValues?.protein || '0g',
          ingredients: labelData.ingredients || 'Ingredients not specified'
        };
        
        const result = await generateNutritionLabel(productData, labelData.market || 'spain');
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to generate nutrition label');
        }
        
        // For now, we'll create a simple visual representation
        // In a real implementation, this would generate an actual image
        const mockImageData = createMockLabelImage(result.data);
        setGeneratedImage(mockImageData);

    } catch (err) {
      console.error('Error generating visual label:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate visual label');
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `nutrition-label-${labelData.productName || 'product'}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Visual Nutrition Label Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedImage && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Generate a visual nutrition label based on your product data
            </p>
            <Button 
              onClick={generateVisualLabel} 
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Visual Label...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Generate Visual Label
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {generatedImage && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Generated Nutrition Label</h3>
              <img 
                src={generatedImage} 
                alt="Generated Nutrition Label" 
                className="max-w-full h-auto mx-auto border border-gray-200 rounded-lg shadow-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={downloadImage} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setGeneratedImage(null);
                  setError(null);
                }}
                className="flex-1"
              >
                Generate New Label
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
