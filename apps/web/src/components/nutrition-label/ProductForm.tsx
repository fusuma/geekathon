import React from 'react';
import { ProductData } from '../../services/bedrockService';

interface ProductFormProps {
  productData: ProductData;
  setProductData: (data: ProductData) => void;
}

export default function ProductForm({ productData, setProductData }: ProductFormProps) {
  const handleChange = (field: keyof ProductData, value: string) => {
    setProductData({
      ...productData,
      [field]: value
    });
  };

  return (
    <div className="product-form">
      <h3>Product Information</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Product Name:</label>
          <input
            id="name"
            type="text"
            value={productData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Grass-Fed Whey Protein"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="serving_size">Serving Size:</label>
          <input
            id="serving_size"
            type="text"
            value={productData.serving_size}
            onChange={(e) => handleChange('serving_size', e.target.value)}
            placeholder="e.g., 1 Scoop (37.4g)"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="servings_per_container">Servings per Container:</label>
          <input
            id="servings_per_container"
            type="number"
            value={productData.servings_per_container}
            onChange={(e) => handleChange('servings_per_container', e.target.value)}
            placeholder="25"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="calories">Calories:</label>
          <input
            id="calories"
            type="number"
            value={productData.calories}
            onChange={(e) => handleChange('calories', e.target.value)}
            placeholder="150"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="total_fat">Total Fat (g):</label>
          <input
            id="total_fat"
            type="number"
            step="0.1"
            value={productData.total_fat}
            onChange={(e) => handleChange('total_fat', e.target.value)}
            placeholder="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="protein">Protein (g):</label>
          <input
            id="protein"
            type="number"
            step="0.1"
            value={productData.protein}
            onChange={(e) => handleChange('protein', e.target.value)}
            placeholder="25"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="ingredients">Ingredients:</label>
        <textarea
          id="ingredients"
          value={productData.ingredients}
          onChange={(e) => handleChange('ingredients', e.target.value)}
          placeholder="100% Grass-Fed Whey Protein Isolate, Coconut Oil Creamer..."
          rows={3}
        />
      </div>
    </div>
  );
}
