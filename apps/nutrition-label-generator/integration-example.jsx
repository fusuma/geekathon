// Integration Example for SmartLabel AI
// This file shows how to integrate the Nutrition Label Generator into your main application

import React from 'react';
import LabelGenerator from './frontend/components/LabelGenerator';

/**
 * Example 1: Standalone Nutrition Generator Page
 * Create a new route in your Next.js application
 */
export function NutritionGeneratorPage() {
    return (
        <div className="min-h-screen bg-gray-900">
            <LabelGenerator />
        </div>
    );
}

/**
 * Example 2: Integration with existing SmartLabel AI layout
 * Use this in your main application with consistent styling
 */
export function IntegratedNutritionGenerator() {
    return (
        <div className="space-y-6">
            {/* Your existing header/navigation */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-100">SmartLabel AI</h1>
                {/* Your existing navigation */}
            </div>
            
            {/* Nutrition Label Generator */}
            <LabelGenerator />
        </div>
    );
}

/**
 * Example 3: Modal/Dialog Integration
 * Use this to show the generator in a modal
 */
export function NutritionGeneratorModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-100">Nutrition Label Generator</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <LabelGenerator />
                </div>
            </div>
        </div>
    );
}

/**
 * Example 4: Tab Integration
 * Use this to add the generator as a tab in your existing interface
 */
export function TabbedNutritionGenerator() {
    const [activeTab, setActiveTab] = React.useState('nutrition');

    return (
        <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('labels')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'labels'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                        }`}
                    >
                        Smart Labels
                    </button>
                    <button
                        onClick={() => setActiveTab('nutrition')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'nutrition'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                        }`}
                    >
                        Nutrition Labels
                    </button>
                    <button
                        onClick={() => setActiveTab('crisis')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'crisis'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                        }`}
                    >
                        Crisis Response
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'labels' && (
                    <div className="text-gray-300">
                        {/* Your existing Smart Label content */}
                        <p>Smart Label functionality would go here...</p>
                    </div>
                )}
                {activeTab === 'nutrition' && <LabelGenerator />}
                {activeTab === 'crisis' && (
                    <div className="text-gray-300">
                        {/* Your existing Crisis Response content */}
                        <p>Crisis Response functionality would go here...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Example usage in a Next.js page:
/*
// pages/nutrition-generator.js or app/nutrition-generator/page.js
import { NutritionGeneratorPage } from '../nutrition-label-generator/integration-example';

export default function NutritionPage() {
    return <NutritionGeneratorPage />;
}
*/

// Example usage with routing:
/*
// In your main layout or page component
import { TabbedNutritionGenerator } from '../nutrition-label-generator/integration-example';

export default function MainPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <TabbedNutritionGenerator />
        </div>
    );
}
*/
