import React, { useState } from 'react';
import ProductForm from './ProductForm';
import LabelPreview from './LabelPreview';
import MarketSelector from './MarketSelector';
import { generateNutritionLabel, ProductData, NutritionLabelData } from '../../services/bedrockService';
import { createNutritionLabelCanvas, downloadCanvasAsImage } from '../../services/labelRenderer';

export default function LabelGenerator() {
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    serving_size: '',
    servings_per_container: '',
    calories: '',
    total_fat: '',
    protein: '',
    ingredients: ''
  });
  
  const [market, setMarket] = useState('spain');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [labelData, setLabelData] = useState<NutritionLabelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const handleGenerateLabel = async () => {
    setLoading(true);
    try {
      const generated = await generateNutritionLabel(productData, market, certifications);
      setLabelData(generated);
      
      const labelCanvas = createNutritionLabelCanvas(generated, market);
      setCanvas(labelCanvas);
    } catch (error) {
      console.error('Error generating label:', error);
      alert('Error generating label. Please check your AWS configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (canvas) {
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `nutrition_label_${market}_${productData.name.replace(/\s+/g, '_')}_${timestamp}.png`;
      downloadCanvasAsImage(canvas, filename);
    }
  };

  return (
    <div className="label-generator">
      <div className="generator-controls">
        <ProductForm 
          productData={productData}
          setProductData={setProductData}
        />
        
        <MarketSelector 
          market={market}
          setMarket={setMarket}
          certifications={certifications}
          setCertifications={setCertifications}
        />
        
        <button 
          onClick={handleGenerateLabel}
          disabled={loading || !productData.name}
          className="generate-button"
        >
          {loading ? 'Generating...' : 'Generate Nutrition Label'}
        </button>
      </div>
      
      <div className="generator-preview">
        <LabelPreview 
          canvas={canvas}
          labelData={labelData}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}
