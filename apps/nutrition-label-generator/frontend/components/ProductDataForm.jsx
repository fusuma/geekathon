import React, { useState } from 'react';

const initialFormData = {
    product_name: '',
    serving_size: '',
    servings_per_container: '',
    calories: '',
    nutritional_values: {
        total_fat: { amount: '', unit: 'g', daily_value: '' },
        saturated_fat: { amount: '', unit: 'g', daily_value: '', indented: true },
        trans_fat: { amount: '', unit: 'g', daily_value: '', indented: true },
        cholesterol: { amount: '', unit: 'mg', daily_value: '' },
        sodium: { amount: '', unit: 'mg', daily_value: '' },
        total_carbohydrate: { amount: '', unit: 'g', daily_value: '' },
        dietary_fiber: { amount: '', unit: 'g', daily_value: '', indented: true },
        total_sugars: { amount: '', unit: 'g', daily_value: '', indented: true },
        added_sugars: { amount: '', unit: 'g', daily_value: '', indented: true },
        protein: { amount: '', unit: 'g', daily_value: '' },
        vitamin_d: { amount: '', unit: 'mcg', daily_value: '' },
        calcium: { amount: '', unit: 'mg', daily_value: '' },
        iron: { amount: '', unit: 'mg', daily_value: '' },
        potassium: { amount: '', unit: 'mg', daily_value: '' },
    },
    ingredients_list: '',
    market: 'spain',
    certifications: [],
};

const ProductDataForm = ({ onGenerate, onGenerateCrisis, loading }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [crisisInfo, setCrisisInfo] = useState({ type: 'recall', details: '' });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                certifications: checked
                    ? [...prev.certifications, value]
                    : prev.certifications.filter(cert => cert !== value)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNutritionChange = (e, nutrientName, field) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            nutritional_values: {
                ...prev.nutritional_values,
                [nutrientName]: {
                    ...prev.nutritional_values[nutrientName],
                    [field]: value
                }
            }
        }));
    };

    const handleCrisisChange = (e) => {
        const { name, value } = e.target;
        setCrisisInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate(formData);
    };

    const handleCrisisSubmit = (e) => {
        e.preventDefault();
        onGenerateCrisis(formData, crisisInfo);
    };

    const markets = [
        { value: 'spain', label: 'Spain (EU)' },
        { value: 'angola', label: 'Angola' },
        { value: 'macau', label: 'Macau' },
        { value: 'brazil', label: 'Brazil' },
        { value: 'halal', label: 'Middle East (Halal)' },
    ];

    const certifications = ['Halal', 'IFS', 'Organic', 'Non-GMO'];

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
                        <path d="M12 22V12"></path>
                        <polyline points="3.29 7 12 12 20.71 7"></polyline>
                        <path d="m7.5 4.27 9 5.15"></path>
                    </svg>
                    Product Details
                </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Product Information */}
                <div>
                    <label htmlFor="product_name" className="block text-sm font-medium text-gray-300 mb-2">
                        Product Name *
                    </label>
                    <input 
                        type="text" 
                        name="product_name" 
                        id="product_name" 
                        value={formData.product_name} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Premium Whey Protein Powder"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="serving_size" className="block text-sm font-medium text-gray-300 mb-2">
                            Serving Size *
                        </label>
                        <input 
                            type="text" 
                            name="serving_size" 
                            id="serving_size" 
                            value={formData.serving_size} 
                            onChange={handleChange} 
                            required 
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 1 Scoop (37.4g)"
                        />
                    </div>
                    <div>
                        <label htmlFor="servings_per_container" className="block text-sm font-medium text-gray-300 mb-2">
                            Servings Per Container *
                        </label>
                        <input 
                            type="text" 
                            name="servings_per_container" 
                            id="servings_per_container" 
                            value={formData.servings_per_container} 
                            onChange={handleChange} 
                            required 
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 25"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="calories" className="block text-sm font-medium text-gray-300 mb-2">
                        Calories (per serving) *
                    </label>
                    <input 
                        type="number" 
                        name="calories" 
                        id="calories" 
                        value={formData.calories} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="150"
                    />
                </div>

                {/* Nutritional Values */}
                <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Nutritional Values (per serving)</h3>
                    <div className="space-y-3">
                        {Object.entries(formData.nutritional_values).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                <label className="block text-sm font-medium text-gray-300 capitalize">
                                    {key.replace(/_/g, ' ')}
                                    {value.indented && <span className="text-xs text-gray-500 ml-2">(indented)</span>}
                                </label>
                                <input 
                                    type="number" 
                                    value={value.amount} 
                                    onChange={(e) => handleNutritionChange(e, key, 'amount')} 
                                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Amount" 
                                />
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={value.unit} 
                                        onChange={(e) => handleNutritionChange(e, key, 'unit')} 
                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Unit" 
                                    />
                                    <input 
                                        type="number" 
                                        value={value.daily_value} 
                                        onChange={(e) => handleNutritionChange(e, key, 'daily_value')} 
                                        className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="DV%" 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ingredients */}
                <div>
                    <label htmlFor="ingredients_list" className="block text-sm font-medium text-gray-300 mb-2">
                        Ingredients List *
                    </label>
                    <textarea 
                        name="ingredients_list" 
                        id="ingredients_list" 
                        rows="4" 
                        value={formData.ingredients_list} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="List all ingredients in descending order of predominance..."
                    />
                </div>

                {/* Target Market */}
                <div>
                    <label htmlFor="market" className="block text-sm font-medium text-gray-300 mb-2">
                        Target Market
                    </label>
                    <select 
                        name="market" 
                        id="market" 
                        value={formData.market} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {markets.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                {/* Certifications */}
                <div>
                    <span className="block text-sm font-medium text-gray-300 mb-2">Certifications</span>
                    <div className="grid grid-cols-2 gap-2">
                        {certifications.map(cert => (
                            <label key={cert} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="certifications"
                                    value={cert}
                                    checked={formData.certifications.includes(cert)}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="ml-2 text-gray-300 text-sm">{cert}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
                                <path d="M12 22V12"></path>
                                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                                <path d="m7.5 4.27 9 5.15"></path>
                            </svg>
                            Generate Nutrition Label
                        </>
                    )}
                </button>

                {/* Crisis Response Section */}
                <div className="border-t border-gray-700 pt-6">
                    <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Crisis Response
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="crisis_type" className="block text-sm font-medium text-gray-300 mb-2">
                                Crisis Type
                            </label>
                            <select 
                                name="type" 
                                id="crisis_type" 
                                value={crisisInfo.type} 
                                onChange={handleCrisisChange} 
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="recall">Product Recall</option>
                                <option value="allergen_contamination">Allergen Contamination</option>
                                <option value="regulatory_change">Regulatory Change</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="crisis_details" className="block text-sm font-medium text-gray-300 mb-2">
                                Crisis Details *
                            </label>
                            <textarea 
                                name="details" 
                                id="crisis_details" 
                                rows="3" 
                                value={crisisInfo.details} 
                                onChange={handleCrisisChange} 
                                required 
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe the crisis situation..."
                            />
                        </div>
                        
                        <button 
                            type="button" 
                            onClick={handleCrisisSubmit} 
                            disabled={loading} 
                            className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Generating Crisis Label...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                    Generate Crisis Label
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductDataForm;