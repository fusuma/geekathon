"use client";

import { useState } from 'react';
import { CrisisResponse, CommunicationMaterial } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LabelDisplay } from '../label-display';

interface CrisisResponseDisplayProps {
  response: CrisisResponse;
  onGenerateNew: () => void;
  isUrgent?: boolean;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-green-600';
    case 'medium': return 'bg-yellow-600';
    case 'high': return 'bg-orange-600';
    case 'critical': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
};

const getMaterialTypeIcon = (type: string) => {
  switch (type) {
    case 'press-release': return '📰';
    case 'regulatory-notice': return '📋';
    case 'customer-email': return '📧';
    case 'social-media': return '📱';
    case 'internal-memo': return '📄';
    default: return '📝';
  }
};

const getCrisisTypeIcon = (type: string) => {
  switch (type) {
    case 'contamination': return '🦠';
    case 'allergen': return '⚠️';
    case 'packaging': return '📦';
    case 'regulatory': return '⚖️';
    case 'supply-chain': return '🔗';
    default: return '🚨';
  }
};

export function CrisisResponseDisplay({
  response,
  onGenerateNew,
  isUrgent = false
}: CrisisResponseDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'labels' | 'communications' | 'actions'>('overview');
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());

  const toggleMaterial = (materialId: string) => {
    const newExpanded = new Set(expandedMaterials);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedMaterials(newExpanded);
  };

  const groupedMaterials = response.communicationMaterials.reduce((acc, material) => {
    const key = `${material.type}_${material.market}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(material);
    return acc;
  }, {} as Record<string, CommunicationMaterial[]>);

  const completedActions = response.actionPlan.filter(action => action.completed).length;
  const totalActions = response.actionPlan.length;

  return (
    <div className={`${isUrgent ? 'bg-red-950/30 border-2 border-red-600/50' : 'bg-gray-800'} rounded-lg border border-gray-700 overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 ${isUrgent ? 'bg-red-900/40' : 'bg-gray-700/30'} border-b border-gray-700`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-600' : 'bg-blue-600'}`}>
              {getCrisisTypeIcon(response.scenario.crisisType)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-100">
                Crisis Response Generated
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getSeverityColor(response.scenario.severity)} text-white`}>
                  {response.scenario.severity.toUpperCase()}
                </Badge>
                <span className="text-gray-300">•</span>
                <span className="text-gray-300 capitalize">{response.scenario.crisisType} Crisis</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-300">{response.scenario.affectedMarkets.length} Markets</span>
              </div>
            </div>
          </div>

          {isUrgent && (
            <div className="flex items-center gap-2 text-red-400">
              <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-semibold">URGENT RESPONSE</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'labels', label: 'Revised Labels', icon: '🏷️' },
          { id: 'communications', label: 'Communications', icon: '📢' },
          { id: 'actions', label: 'Action Plan', icon: '✅' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? (isUrgent ? 'border-red-500 text-red-400 bg-red-950/20' : 'border-blue-500 text-blue-400 bg-blue-950/20')
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Crisis Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2 font-medium capitalize">{response.scenario.crisisType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Severity:</span>
                    <Badge className={`ml-2 ${getSeverityColor(response.scenario.severity)} text-white`}>
                      {response.scenario.severity}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-400">Generated:</span>
                    <span className="ml-2 font-medium">
                      {new Date(response.generatedAt).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Affected Scope</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-gray-400">Products:</span>
                    <span className="ml-2 font-medium">{response.scenario.affectedProducts.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Markets:</span>
                    <span className="ml-2 font-medium">{response.scenario.affectedMarkets.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Materials:</span>
                    <span className="ml-2 font-medium">{response.communicationMaterials.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Action Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-gray-400">Progress:</span>
                    <span className="ml-2 font-medium">{completedActions}/{totalActions}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`${isUrgent ? 'bg-red-500' : 'bg-blue-500'} h-2 rounded-full transition-all`}
                      style={{ width: `${(completedActions / totalActions) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Crisis Description</h3>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-gray-300">{response.scenario.description}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Estimated Impact</h3>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-gray-300">{response.estimatedImpact}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'labels' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-100">Revised Product Labels</h3>
              <Badge className="bg-yellow-600 text-white">
                ⚠️ Updated with Warnings
              </Badge>
            </div>
            <div className="grid gap-6">
              {Object.entries(response.revisedLabels).map(([market, label]) => (
                <Card key={market}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>Market: {market}</span>
                      <Badge variant="outline">{label.language}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LabelDisplay
                      label={label}
                      onGenerateNew={onGenerateNew}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'communications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-100">Communication Materials</h3>
              <Badge className="bg-green-600 text-white">
                {Object.keys(groupedMaterials).length} Templates Generated
              </Badge>
            </div>

            <div className="grid gap-4">
              {Object.entries(groupedMaterials).map(([key, materials]) => {
                const material = materials[0]; // Use first material for header info
                const materialId = key;
                const isExpanded = expandedMaterials.has(materialId);

                if (!material) return null;

                return (
                  <Collapsible key={key}>
                    <CollapsibleTrigger
                      onClick={() => toggleMaterial(materialId)}
                      className="w-full text-left"
                    >
                      <Card className="cursor-pointer hover:bg-gray-700/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getMaterialTypeIcon(material.type)}</span>
                              <div>
                                <h4 className="font-semibold capitalize">{material.type.replace('-', ' ')}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <span>Market: {material.market}</span>
                                  <span>•</span>
                                  <span>Language: {material.language}</span>
                                  <span>•</span>
                                  <Badge className={`${getSeverityColor(material.urgency)} text-white text-xs`}>
                                    {material.urgency}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {material.reviewRequired && (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                  Review Required
                                </Badge>
                              )}
                              <svg
                                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="mt-2 space-y-3">
                        {materials.map((mat, index) => (
                          <Card key={index} className="bg-gray-700/30">
                            <CardContent className="p-4">
                              <div className="whitespace-pre-wrap text-sm text-gray-300 font-mono bg-gray-800 p-3 rounded border">
                                {mat.content}
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button size="sm" variant="outline">
                                  📋 Copy
                                </Button>
                                <Button size="sm" variant="outline">
                                  📥 Download
                                </Button>
                                {mat.reviewRequired && (
                                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                                    🔍 Send for Review
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-100">Crisis Action Plan</h3>
              <div className="flex gap-2">
                <Badge className="bg-green-600 text-white">
                  {completedActions} Completed
                </Badge>
                <Badge className="bg-blue-600 text-white">
                  {totalActions - completedActions} Pending
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {response.actionPlan.map((action, index) => (
                <Card key={index} className={action.completed ? 'bg-green-950/20 border-green-600/30' : 'bg-gray-700/30'}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                        action.completed ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {action.completed ? (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium ${action.completed ? 'text-green-300' : 'text-gray-100'}`}>
                            {action.action}
                          </h4>
                          <Badge className={`${getSeverityColor(action.priority)} text-white text-xs`}>
                            {action.priority}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span>⏱️ {action.timeframe}</span>
                          {action.responsible && (
                            <>
                              <span>•</span>
                              <span>👤 {action.responsible}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-gray-700/30 border-t border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onGenerateNew} variant="outline" className="flex-1">
            🔄 Generate New Crisis Response
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700">
            📤 Export Complete Package
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            👥 Share with Team
          </Button>
        </div>
      </div>
    </div>
  );
}