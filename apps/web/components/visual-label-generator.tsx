'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Download, Eye, Loader2 } from 'lucide-react';

interface VisualLabelGeneratorProps {
  labelData: any;
  onClose?: () => void;
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
        const response = await fetch(`https://zdsrl1mlbg.execute-api.us-east-1.amazonaws.com/Prod/labels/visual`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productName: labelData.productName || 'Product',
            servingSize: labelData.servingSize || '1 serving',
            servingsPerContainer: labelData.servingsPerContainer || '1',
            calories: labelData.calories || '0',
            nutritionalValues: labelData.nutritionalValues || {},
            ingredients: labelData.ingredients || 'Ingredients not specified',
            market: labelData.market || 'spain',
            certifications: labelData.certifications || []
          })
        });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate visual label');
      }

      const result = await response.json();
      
      if (result.success && result.data?.image_base64) {
        setGeneratedImage(`data:image/png;base64,${result.data.image_base64}`);
      } else {
        throw new Error('No image data received');
      }

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
