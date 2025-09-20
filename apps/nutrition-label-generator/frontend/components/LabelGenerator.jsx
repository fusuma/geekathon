import React, { useState } from 'react';
import ProductDataForm from './ProductDataForm';
import LabelPreview from './LabelPreview';
import { generateNutritionLabel, generateCrisisLabel } from '../utils/api';

const LabelGenerator = () => {
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
            const response = await generateNutritionLabel(formData);
            if (response.success && response.image_base64) {
                setLabelImage(`data:image/png;base64,${response.image_base64}`);
                setLabelData(response.label_data);
            } else {
                setError(response.error || "Failed to generate label.");
            }
        } catch (err) {
            setError("An error occurred while connecting to the backend.");
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
            const response = await generateCrisisLabel(originalData, crisisInfo);
            if (response.success && response.image_base64) {
                setLabelImage(`data:image/png;base64,${response.image_base64}`);
                setLabelData(response.label_data);
                setCrisisCommunication(response.crisis_communication_text);
            } else {
                setError(response.error || "Failed to generate crisis label.");
            }
        } catch (err) {
            setError("An error occurred while connecting to the backend.");
            console.error("Error generating crisis label:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-gray-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                        <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
                        <path d="M12 22V12"></path>
                        <polyline points="3.29 7 12 12 20.71 7"></polyline>
                        <path d="m7.5 4.27 9 5.15"></path>
                    </svg>
                    Nutrition Label Generator
                </h1>
                <p className="text-gray-400">Create AI-powered compliant nutrition labels for multiple markets</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <ProductDataForm
                        onGenerate={handleGenerateLabel}
                        onGenerateCrisis={handleGenerateCrisisLabel}
                        loading={loading}
                    />
                </div>
                
                <div className="space-y-6">
                    {loading && (
                        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-300 text-lg">Generating label...</p>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {error}</span>
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
                        <div className="bg-gray-800 rounded-lg shadow-inner border border-gray-700 p-8 text-center">
                            <div className="text-gray-400 text-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                                    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
                                    <path d="M12 22V12"></path>
                                    <polyline points="3.29 7 12 12 20.71 7"></polyline>
                                    <path d="m7.5 4.27 9 5.15"></path>
                                </svg>
                                <p>No label generated yet.</p>
                                <p className="text-sm mt-2">Fill the form and click "Generate Label" to create your nutrition label.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LabelGenerator;