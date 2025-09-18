"use client"

// import { Label } from "@repo/shared"

type Market = 'US' | 'UK' | 'ES' | 'AO' | 'MO' | 'BR' | 'AE';

interface Label {
  labelId: string;
  market: Market;
  labelData: {
    productName: string;
    ingredients: string[];
    nutritionalInfo: Record<string, any>;
    warnings: string[];
    complianceNotes: string[];
    legalLabel?: {
      ingredients: string;
      [key: string]: any;
    };
  };
  language?: string;
  createdAt?: string;
  generatedBy?: string;
}

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Eye, EyeOff } from "lucide-react"
import { MARKET_CONFIG } from "@/lib/market-config"
import { ExportDialog } from "@/components/export/export-dialog"
import { useState } from "react"

interface LabelDisplayProps {
  label: Label
  onGenerateNew: () => void
  showMarketHeader?: boolean
}

export function LabelDisplay({ label, onGenerateNew, showMarketHeader = false }: LabelDisplayProps) {
  const marketConfig = MARKET_CONFIG[label.market as keyof typeof MARKET_CONFIG];
  const [showDetails, setShowDetails] = useState({
    ingredients: true,
    allergens: true,
    nutrition: true,
    marketing: true,
    warnings: true,
    compliance: true,
    metadata: false,
  });
  const handleCopyToClipboard = () => {
    const labelText = `
PRODUCT: ${label.labelData.legalLabel?.ingredients || label.labelData.productName}

INGREDIENTS: ${label.labelData.legalLabel?.ingredients || label.labelData.ingredients.join(', ')}

ALLERGENS: ${label.labelData.legalLabel?.allergens || 'None specified'}

NUTRITION INFORMATION (per 100g):
${Object.entries(label.labelData.legalLabel?.nutrition || label.labelData.nutritionalInfo)
  .map(([key, value]) => `${key}: ${(value as any)?.per100g?.value}${(value as any)?.per100g?.unit}`)
  .join('\n')}

MARKETING: ${label.labelData.legalLabel?.marketing?.short || 'Standard marketing'}

WARNINGS: ${label.labelData.warnings.join(', ')}

COMPLIANCE NOTES: ${label.labelData.complianceNotes.join(', ')}
    `.trim()

    navigator.clipboard.writeText(labelText)
  }

  return (
    <div className="space-y-6">
      {/* Market Header (for comparison view) */}
      {showMarketHeader && (
        <div className="flex items-center gap-3 pb-4 border-b border-gray-600">
          <span className="text-2xl">🏷️</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{marketConfig?.label || label.market}</h3>
            <p className="text-sm text-gray-400">Market: {label.market}</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {label.language?.toUpperCase() || 'N/A'}
          </Badge>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">
          {showMarketHeader ? 'Smart Label' : 'Generated Smart Label'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <ExportDialog
            label={label}
            trigger={
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(prev => ({ ...prev, metadata: !prev.metadata }))}
          >
            {showDetails.metadata ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails.metadata ? 'Hide' : 'Show'} Details
          </Button>
        </div>
      </div>

      {/* Legal Label Information */}
      <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-100">Legal Label Information</h3>

        <div>
          <h4 className="font-medium text-gray-100 mb-2">Ingredients</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {label.labelData.legalLabel?.ingredients || label.labelData.ingredients.join(', ')}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-100 mb-2">Allergen Information</h4>
          <p className="text-gray-300 text-sm">
            {label.labelData.legalLabel?.allergens || 'N/A'}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-100 mb-2">Nutrition Information (per 100g)</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nutrient
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Per 100g
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-gray-600">
                {Object.entries(label.labelData.legalLabel?.nutrition || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-100 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                      {(value as any)?.per100g?.value}{(value as any)?.per100g?.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Marketing Information */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-3">Marketing Information</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {label.labelData.legalLabel?.marketing?.short || 'N/A'}
        </p>
      </div>

      {/* Warnings */}
      {label.labelData.warnings.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Important Warnings</h3>
          <ul className="space-y-1">
            {label.labelData.warnings.map((warning, index) => (
              <li key={index} className="text-amber-300 text-sm flex items-start">
                <span className="text-amber-400 mr-2">⚠️</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compliance Notes */}
      {label.labelData.complianceNotes.length > 0 && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Compliance Notes</h3>
          <ul className="space-y-1">
            {label.labelData.complianceNotes.map((note, index) => (
              <li key={index} className="text-green-300 text-sm flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Label Metadata */}
      <div className="bg-gray-600 border border-gray-500 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-3">Label Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-100">Label ID:</span>
            <p className="text-gray-300">{label.labelId}</p>
          </div>
          <div>
            <span className="font-medium text-gray-100">Market:</span>
            <p className="text-gray-300">{label.market}</p>
          </div>
          <div>
            <span className="font-medium text-gray-100">Generated:</span>
            <p className="text-gray-300">{label.createdAt ? new Date(label.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-100">Generated By:</span>
            <p className="text-gray-300">{label.generatedBy}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-6 border-t">
        <Button onClick={onGenerateNew} size="lg">
          Generate New Label
        </Button>
      </div>
    </div>
  )
}