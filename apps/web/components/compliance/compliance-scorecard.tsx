'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, ChevronDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAppStore, MARKET_CONFIG } from '@/stores/app-store';
import type { Market, Label } from '@repo/shared';

// Compliance scoring types
export interface ComplianceScore {
  overall: number;
  categories: {
    nutrition: number;
    ingredients: number;
    allergens: number;
    certifications: number;
    legal: number;
  };
  issues: string[];
  recommendations: string[];
}

interface ComplianceScorecardProps {
  market: Market;
  label?: Label | null;
  className?: string;
}

// Mock compliance scoring algorithm
function calculateComplianceScore(label: Label): ComplianceScore {
  const categories = {
    nutrition: 0,
    ingredients: 0,
    allergens: 0,
    certifications: 0,
    legal: 0,
  };

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Nutrition scoring
  const nutrition = label.labelData.legalLabel.nutrition;
  const nutritionFields = Object.keys(nutrition).length;

  if (nutritionFields >= 6) {
    categories.nutrition = 95;
  } else if (nutritionFields >= 4) {
    categories.nutrition = 75;
    recommendations.push('Consider adding more detailed nutrition information');
  } else {
    categories.nutrition = 45;
    issues.push('Missing essential nutrition information');
  }

  // Ingredients scoring
  const ingredients = label.labelData.legalLabel.ingredients;
  if (ingredients.length > 100) {
    categories.ingredients = 90;
  } else if (ingredients.length > 50) {
    categories.ingredients = 70;
    recommendations.push('Consider more detailed ingredient descriptions');
  } else {
    categories.ingredients = 40;
    issues.push('Ingredients list too brief for regulatory compliance');
  }

  // Allergens scoring
  const allergens = label.labelData.legalLabel.allergens;
  if (allergens.toLowerCase().includes('contains') || allergens.toLowerCase().includes('may contain')) {
    categories.allergens = 95;
  } else if (allergens.length > 10) {
    categories.allergens = 75;
  } else {
    categories.allergens = 60;
    recommendations.push('Improve allergen declaration format');
  }

  // Certifications scoring (based on market)
  const marketConfig = MARKET_CONFIG[label.market];
  if (label.market === 'EU' || label.market === 'ES') {
    categories.certifications = 85;
  } else if (label.market === 'BR') {
    categories.certifications = 80;
    recommendations.push('Consider ANVISA-specific certifications');
  } else {
    categories.certifications = 70;
    recommendations.push('Research local certification requirements');
  }

  // Legal compliance scoring
  const warnings = label.labelData.warnings.length;
  const compliance = label.labelData.complianceNotes.length;

  if (warnings === 0 && compliance > 2) {
    categories.legal = 90;
  } else if (warnings <= 1 && compliance > 1) {
    categories.legal = 75;
  } else {
    categories.legal = 55;
    issues.push('Potential legal compliance gaps detected');
  }

  // Calculate overall score
  const overall = Math.round(
    Object.values(categories).reduce((sum, score) => sum + score, 0) / 5
  );

  return {
    overall,
    categories,
    issues,
    recommendations,
  };
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400 bg-green-900/20 border-green-600/30';
  if (score >= 75) return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
  if (score >= 60) return 'text-orange-400 bg-orange-900/20 border-orange-600/30';
  return 'text-red-400 bg-red-900/20 border-red-600/30';
}

function getScoreIcon(score: number) {
  if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-400" />;
  if (score >= 75) return <Info className="w-5 h-5 text-yellow-400" />;
  if (score >= 60) return <AlertTriangle className="w-5 h-5 text-orange-400" />;
  return <XCircle className="w-5 h-5 text-red-400" />;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
}

export function ComplianceScorecard({ market, label, className }: ComplianceScorecardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const marketConfig = MARKET_CONFIG[market];

  if (!label) {
    return (
      <div className={cn('bg-gray-800 border border-gray-700 rounded-lg p-6', className)}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{marketConfig.flag}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{marketConfig.name}</h3>
            <p className="text-sm text-gray-400">Compliance Analysis</p>
          </div>
        </div>
        <div className="text-center text-gray-400 py-8">
          <p>No label available for compliance analysis</p>
        </div>
      </div>
    );
  }

  const compliance = calculateComplianceScore(label);

  const handleExportCompliance = () => {
    const exportData = {
      market: marketConfig.name,
      labelId: label.labelId,
      compliance,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${market}-${label.labelId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('bg-gray-800 border border-gray-700 rounded-lg p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{marketConfig.flag}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{marketConfig.name}</h3>
            <p className="text-sm text-gray-400">Compliance Scorecard</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCompliance}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Overall Score */}
      <div className={cn('rounded-lg border p-4 mb-6', getScoreColor(compliance.overall))}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getScoreIcon(compliance.overall)}
            <div>
              <div className="text-2xl font-bold">{compliance.overall}%</div>
              <div className="text-sm opacity-90">{getScoreLabel(compliance.overall)}</div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Overall Compliance
          </Badge>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-300">Category Breakdown</h4>
        {Object.entries(compliance.categories).map(([category, score]) => (
          <div key={category} className="flex items-center justify-between">
            <span className="text-sm text-gray-300 capitalize">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    score >= 90 ? 'bg-green-400' :
                    score >= 75 ? 'bg-yellow-400' :
                    score >= 60 ? 'bg-orange-400' : 'bg-red-400'
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-100 w-8">{score}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Issues and Recommendations */}
      {(compliance.issues.length > 0 || compliance.recommendations.length > 0) && (
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium text-gray-300">
                Issues & Recommendations ({compliance.issues.length + compliance.recommendations.length})
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showDetails && "transform rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Issues */}
            {compliance.issues.length > 0 && (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <h5 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Issues ({compliance.issues.length})
                </h5>
                <ul className="space-y-1">
                  {compliance.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {compliance.recommendations.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Recommendations ({compliance.recommendations.length})
                </h5>
                <ul className="space-y-1">
                  {compliance.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-blue-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// Comparison compliance view
export function ComplianceComparison({ markets, className }: { markets: Market[], className?: string }) {
  const { labels } = useAppStore();

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Multi-Market Compliance Analysis</h2>
        <p className="text-gray-400 mt-2">Compare regulatory compliance across selected markets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <ComplianceScorecard
            key={market}
            market={market}
            label={labels[market]}
          />
        ))}
      </div>
    </div>
  );
}