'use client';

import { useState } from 'react';
import { AlertTriangle, Globe } from 'lucide-react';

interface CrisisFormData {
  crisisType: string;
  severity: string;
  description: string;
  affectedProducts: string[];
  affectedMarkets: string[];
  timeline: string;
  additionalInfo?: string;
}

interface CrisisResponseFormProps {
  onSubmit: (data: CrisisFormData) => void;
  isProcessing?: boolean;
}

const CRISIS_TYPES = [
  { value: 'contamination', label: 'Contamination', description: 'Bacterial, chemical, or physical contamination' },
  { value: 'allergen', label: 'Allergen Issue', description: 'Undeclared allergens or cross-contamination' },
  { value: 'packaging', label: 'Packaging Error', description: 'Incorrect packaging or labeling' },
  { value: 'regulatory', label: 'Regulatory Issue', description: 'Compliance or regulatory violation' },
  { value: 'supply-chain', label: 'Supply Chain', description: 'Supplier or ingredient quality issue' }
];

const SEVERITY_LEVELS = [
  { value: 'critical', label: 'Critical', description: 'Immediate health risk, requires urgent action', color: 'text-red-500' },
  { value: 'high', label: 'High', description: 'Significant risk, requires immediate attention', color: 'text-orange-500' },
  { value: 'medium', label: 'Medium', description: 'Moderate risk, requires prompt action', color: 'text-yellow-500' },
  { value: 'low', label: 'Low', description: 'Minor issue, requires monitoring', color: 'text-green-500' }
];

const AVAILABLE_MARKETS = ['US', 'UK', 'ES', 'AO', 'MO', 'BR', 'AE', 'EU'];

export function CrisisResponseForm({ onSubmit, isProcessing = false }: CrisisResponseFormProps) {
  const [formData, setFormData] = useState<CrisisFormData>({
    crisisType: '',
    severity: '',
    description: '',
    affectedProducts: [],
    affectedMarkets: [],
    timeline: '',
    additionalInfo: ''
  });

  const [newProduct, setNewProduct] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CrisisFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProductAdd = () => {
    if (newProduct.trim() && !formData.affectedProducts.includes(newProduct.trim())) {
      setFormData(prev => ({
        ...prev,
        affectedProducts: [...prev.affectedProducts, newProduct.trim()]
      }));
      setNewProduct('');
    }
  };

  const handleProductRemove = (product: string) => {
    setFormData(prev => ({
      ...prev,
      affectedProducts: prev.affectedProducts.filter(p => p !== product)
    }));
  };

  const handleMarketToggle = (market: string) => {
    setFormData(prev => ({
      ...prev,
      affectedMarkets: prev.affectedMarkets.includes(market)
        ? prev.affectedMarkets.filter(m => m !== market)
        : [...prev.affectedMarkets, market]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.crisisType) newErrors.crisisType = 'Please select a crisis type';
    if (!formData.severity) newErrors.severity = 'Please select severity level';
    if (!formData.description.trim()) newErrors.description = 'Please provide a description';
    if (formData.affectedProducts.length === 0) newErrors.affectedProducts = 'Please specify affected products';
    if (formData.affectedMarkets.length === 0) newErrors.affectedMarkets = 'Please select affected markets';
    if (!formData.timeline.trim()) newErrors.timeline = 'Please provide timeline information';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-red-400">Crisis Response Management</h2>
            <p className="text-gray-300">Report and manage food safety incidents</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crisis Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Crisis Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CRISIS_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.crisisType === type.value
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="crisisType"
                    value={type.value}
                    checked={formData.crisisType === type.value}
                    onChange={(e) => handleInputChange('crisisType', e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-medium text-white">{type.label}</div>
                  <div className="text-sm text-gray-400 mt-1">{type.description}</div>
                </label>
              ))}
            </div>
            {errors.crisisType && (
              <p className="text-red-400 text-sm mt-1">{errors.crisisType}</p>
            )}
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Severity Level <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SEVERITY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.severity === level.value
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={formData.severity === level.value}
                    onChange={(e) => handleInputChange('severity', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getSeverityIcon(level.value)}</span>
                    <div>
                      <div className={`font-medium ${level.color}`}>{level.label}</div>
                      <div className="text-sm text-gray-400">{level.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.severity && (
              <p className="text-red-400 text-sm mt-1">{errors.severity}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Crisis Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the crisis situation in detail..."
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              rows={4}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Affected Products */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Affected Products <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                placeholder="Enter product name"
                className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleProductAdd())}
              />
              <button
                type="button"
                onClick={handleProductAdd}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            {formData.affectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.affectedProducts.map((product) => (
                  <span
                    key={product}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-sm"
                  >
                    {product}
                    <button
                      type="button"
                      onClick={() => handleProductRemove(product)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.affectedProducts && (
              <p className="text-red-400 text-sm mt-1">{errors.affectedProducts}</p>
            )}
          </div>

          {/* Affected Markets */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Affected Markets <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AVAILABLE_MARKETS.map((market) => (
                <label
                  key={market}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.affectedMarkets.includes(market)
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.affectedMarkets.includes(market)}
                    onChange={() => handleMarketToggle(market)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-white">{market}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.affectedMarkets && (
              <p className="text-red-400 text-sm mt-1">{errors.affectedMarkets}</p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timeline Information <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              placeholder="Provide timeline details (when discovered, affected dates, etc.)..."
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              rows={3}
            />
            {errors.timeline && (
              <p className="text-red-400 text-sm mt-1">{errors.timeline}</p>
            )}
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Information
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Any additional details, contact information, or special instructions..."
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Crisis Report...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Submit Crisis Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
