"use client"

import { Label } from "@repo/shared"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Eye, EyeOff } from "lucide-react"
import { MARKET_CONFIG } from "@/stores/app-store"
import { ExportDialog } from "@/components/export/export-dialog"
import { useState } from "react"

interface LabelDisplayProps {
  label: Label
  onGenerateNew: () => void
  showMarketHeader?: boolean
}

export function LabelDisplay({ label, onGenerateNew, showMarketHeader = false }: LabelDisplayProps) {
  const marketConfig = MARKET_CONFIG[label.market];
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
PRODUCT: ${label.labelData.legalLabel.ingredients}

INGREDIENTS: ${label.labelData.legalLabel.ingredients}

ALLERGENS: ${label.labelData.legalLabel.allergens}

NUTRITION INFORMATION (per 100g):
${Object.entries(label.labelData.legalLabel.nutrition)
  .map(([key, value]) => `${key}: ${value?.per100g?.value}${value?.per100g?.unit}`)
  .join('\n')}

MARKETING: ${label.labelData.marketing.short}

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
          <span className="text-2xl">{marketConfig.flag}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{marketConfig.name}</h3>
            <p className="text-sm text-gray-400">{marketConfig.description}</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {label.language.toUpperCase()}
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
            {label.labelData.legalLabel.ingredients}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-100 mb-2">Allergen Information</h4>
          <p className="text-gray-300 text-sm">
            {label.labelData.legalLabel.allergens}
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
                {Object.entries(label.labelData.legalLabel.nutrition).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-100 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                      {value?.per100g?.value}{value?.per100g?.unit}
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
          {label.labelData.marketing.short}
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
            <p className="text-gray-300">{new Date(label.createdAt).toLocaleDateString()}</p>
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