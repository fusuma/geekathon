'use client';

import { AlertTriangle, Shield, Users, Clock, FileText, Globe, CheckCircle } from 'lucide-react';

interface CrisisAnalysis {
  crisisType: string;
  severity: string;
  description: string;
  affectedProducts: string[];
  affectedMarkets: string[];
  timeline: string;
  analysis: {
    riskAssessment: string;
    immediateActions: string[];
    shortTermActions: string[];
    mediumTermActions: string[];
    communicationPlan: {
      pressRelease: string;
      customerNotice: string;
      regulatoryNotice: string;
    };
    legalCompliance: {
      requirements: string[];
      deadlines: string[];
      contacts: string[];
    };
  };
}

interface CrisisAnalysisResultsProps {
  analysis: CrisisAnalysis;
  onGenerateNew: () => void;
  onExportReport: () => void;
}

export function CrisisAnalysisResults({ 
  analysis, 
  onGenerateNew, 
  onExportReport 
}: CrisisAnalysisResultsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div>
              <h2 className="text-2xl font-bold text-red-400">Crisis Analysis Report</h2>
              <p className="text-gray-300">Comprehensive response plan generated</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onExportReport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export Report
            </button>
            <button
              onClick={onGenerateNew}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              New Crisis Report
            </button>
          </div>
        </div>

        {/* Crisis Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Crisis Summary</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="ml-2 text-white capitalize">{analysis.crisisType.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-400">Severity:</span>
                <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border ${getSeverityColor(analysis.severity)}`}>
                  {getSeverityIcon(analysis.severity)} {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Affected Products:</span>
                <span className="ml-2 text-white">{analysis.affectedProducts.length} product(s)</span>
              </div>
              <div>
                <span className="text-gray-400">Affected Markets:</span>
                <span className="ml-2 text-white">{analysis.affectedMarkets.join(', ')}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Risk Assessment</h3>
            <p className="text-gray-300 leading-relaxed">{analysis.analysis.riskAssessment}</p>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Immediate Actions */}
        <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Immediate Actions</h3>
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">0-2 hours</span>
          </div>
          <ul className="space-y-2">
            {analysis.analysis.immediateActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Short-term Actions */}
        <div className="bg-orange-900/10 border border-orange-500/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-400">Short-term Actions</h3>
            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">2-24 hours</span>
          </div>
          <ul className="space-y-2">
            {analysis.analysis.shortTermActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medium-term Actions */}
        <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Medium-term Actions</h3>
            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">1-7 days</span>
          </div>
          <ul className="space-y-2">
            {analysis.analysis.mediumTermActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Communication Plan */}
      <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-blue-400">Communication Plan</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Press Release */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Press Release
            </h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-300 leading-relaxed">{analysis.analysis.communicationPlan.pressRelease}</p>
            </div>
          </div>

          {/* Customer Notice */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customer Notice
            </h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-300 leading-relaxed">{analysis.analysis.communicationPlan.customerNotice}</p>
            </div>
          </div>

          {/* Regulatory Notice */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Regulatory Notice
            </h4>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-300 leading-relaxed">{analysis.analysis.communicationPlan.regulatoryNotice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Compliance */}
      <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-purple-400">Legal Compliance Requirements</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Requirements */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Compliance Requirements</h4>
            <ul className="space-y-2">
              {analysis.analysis.legalCompliance.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deadlines */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Critical Deadlines</h4>
            <ul className="space-y-2">
              {analysis.analysis.legalCompliance.deadlines.map((deadline, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <Clock className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{deadline}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Key Contacts</h4>
            <ul className="space-y-2">
              {analysis.analysis.legalCompliance.contacts.map((contact, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <Users className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{contact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Crisis Description */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Crisis Details</h3>
        <p className="text-gray-300 leading-relaxed mb-4">{analysis.description}</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Affected Products</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.affectedProducts.map((product, index) => (
                <span key={index} className="px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-sm">
                  {product}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Timeline</h4>
            <p className="text-gray-400 text-sm">{analysis.timeline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
