import React, { useState } from 'react';
import ProductDataForm from './ProductDataForm';
import LabelPreview from './LabelPreview';

const NutritionLabelWidget = () => {
  const [labelImage, setLabelImage] = useState(null);
  const [labelData, setLabelData] = useState(null);
  const [crisisCommunication, setCrisisCommunication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateLabel = async (formData) => {
    setLoading(true);
    setError(null);
    setLabelImage(null);
    setLabelData(null);
    setCrisisCommunication(null);
    
    try {
      const response = await fetch('http://localhost:5001/api/nutrition/generate-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.image_base64) {
        setLabelImage(`data:image/png;base64,${result.image_base64}`);
        setLabelData(result.label_data);
      } else {
        setError(result.error || "Failed to generate label.");
      }
    } catch (err) {
      setError("Error connecting to nutrition label service.");
      console.error("Error generating label:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCrisisLabel = async (originalData, crisisInfo) => {
    setLoading(true);
    setError(null);
    setLabelImage(null);
    setLabelData(null);
    setCrisisCommunication(null);
    
    try {
      const response = await fetch('http://localhost:5001/api/nutrition/crisis-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_product_data: originalData,
          crisis_info: crisisInfo
        }),
      });
      
      const result = await response.json();
      
      if (result.image_base64) {
        setLabelImage(`data:image/png;base64,${result.image_base64}`);
        setLabelData(result.label_data);
        setCrisisCommunication(result.crisis_communication_text);
      } else {
        setError(result.error || "Failed to generate crisis label.");
      }
    } catch (err) {
      setError("Error connecting to nutrition label service.");
      console.error("Error generating crisis label:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-900 rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-2">
              🏷️ SmartLabel AI - Nutrition Label Generator
            </h1>
            <p className="text-gray-400">Generate AI-powered compliant nutrition labels for multiple markets</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-offset-2 text-green-400 border-green-400">
              ✨ AI-Powered
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <ProductDataForm
              onGenerate={handleGenerateLabel}
              onGenerateCrisis={handleGenerateCrisisLabel}
              loading={loading}
            />
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            {loading && (
              <div className="flex items-center justify-center h-64 bg-gray-700 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-300 text-lg">Generating nutrition label...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4" role="alert">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <strong className="font-bold">Error!</strong>
                </div>
                <span className="block mt-1">{error}</span>
              </div>
            )}
            
            {labelImage && (
              <LabelPreview
                labelImage={labelImage}
                labelData={labelData}
                crisisCommunication={crisisCommunication}
              />
            )}
            
            {!loading && !error && !labelImage && (
              <div className="flex items-center justify-center h-64 bg-gray-700 rounded-lg">
                <div className="text-center">
                  <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 text-lg">Fill out the form to generate your nutrition label</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionLabelWidget;
