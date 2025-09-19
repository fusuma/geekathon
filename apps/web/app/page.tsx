'use client';

import { useState, useEffect } from 'react';
import { EnhancedProductForm } from '@/components/forms/enhanced-product-form';
import { SimpleGenerationTrace } from '@/components/animations/simple-generation-trace';
import { EnhancedComparisonLayout } from '@/components/comparison/enhanced-comparison-layout';
import { CrisisResponseForm } from '@/components/forms/crisis-response-form';
import { CrisisAnalysisResults } from '@/components/crisis/crisis-analysis-results';


interface Label {
  labelId?: string;
  productName?: string;
  market?: string;
  language?: string;
  createdAt?: string;
  labelData?: {
    legalLabel?: {
      ingredients?: string;
      allergens?: string;
      nutrition?: any;
    };
    marketing?: {
      short?: string;
      long?: string;
      claims?: string;
    };
  };
}

interface CrisisFormData {
  crisisType: string;
  severity: string;
  description: string;
  affectedProducts: string[];
  affectedMarkets: string[];
  timeline: string;
  additionalInfo?: string;
}

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

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState('form');
  const [showCrisis, setShowCrisis] = useState(false);
  const [crisisStep, setCrisisStep] = useState<'form' | 'analyzing' | 'results'>('form');
  const [labels, setLabels] = useState<Label[]>([]);
  const [productData, setProductData] = useState<any>(null);
  const [crisisData, setCrisisData] = useState<CrisisFormData | null>(null);
  const [crisisAnalysis, setCrisisAnalysis] = useState<CrisisAnalysis | null>(null);

  // Load existing labels on mount
  useEffect(() => {
    loadExistingLabels();
  }, []);

  // Load existing labels from API
  const loadExistingLabels = async () => {
    try {
      const response = await fetch('https://zdsrl1mlbg.execute-api.us-east-1.amazonaws.com/Prod/labels');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLabels(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading labels:', error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    setProductData(data);
    setCurrentStep('generating');
    
    try {
      // Debug: Log the nutrition data being sent
      console.log('Nutrition data being sent:', data.nutrition);
      
      const payload = {
        productName: data.name, // Corrigido: usar 'name' do formulário
        ingredients: data.ingredients,
        nutrition: data.nutrition, // Corrigido: usar 'nutrition' em vez de 'nutritionalInfo'
        market: data.market,
        certifications: data.certifications || [],
        allergens: data.allergens || [],
        description: data.description || ''
      };
      
      console.log('Full payload being sent to API:', payload);
      
      // Call the actual API to generate the label
      const response = await fetch('https://zdsrl1mlbg.execute-api.us-east-1.amazonaws.com/Prod/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Label generated successfully:', result);
      console.log('API Response nutrition data:', result.labelData?.legalLabel?.nutrition);
      
      // Reload labels to show the new one
      await loadExistingLabels();
      
      // Move to the labels step to show all labels including the new one
      setCurrentStep('labels');
    } catch (error) {
      console.error('Error generating label:', error);
      // Handle error, maybe show an error message to the user
      setCurrentStep('form'); // Go back to form on error
    }
  };

  const handleGenerateNew = () => {
    setCurrentStep('form');
  };

  const handleCrisisSubmit = async (data: CrisisFormData) => {
    setCrisisData(data);
    setCrisisStep('analyzing');
    
    try {
      // Simulate crisis analysis (in a real app, this would call your crisis API)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock analysis based on the crisis data
      const analysis: CrisisAnalysis = {
        ...data,
        analysis: {
          riskAssessment: `Based on the ${data.severity} severity ${data.crisisType} crisis affecting ${data.affectedProducts.length} product(s) in ${data.affectedMarkets.length} market(s), immediate action is required to protect consumer safety and maintain regulatory compliance.`,
          immediateActions: [
            "Stop all production and distribution of affected products immediately",
            "Notify regulatory authorities in all affected markets within 24 hours",
            "Implement immediate recall procedures for affected products",
            "Activate crisis management team and establish command center",
            "Begin immediate testing and investigation of root cause"
          ],
          shortTermActions: [
            "Complete comprehensive product testing and analysis",
            "Develop detailed communication strategy for all stakeholders",
            "Coordinate with suppliers to identify and isolate contaminated materials",
            "Implement enhanced quality control measures",
            "Prepare regulatory documentation and compliance reports"
          ],
          mediumTermActions: [
            "Conduct thorough investigation and root cause analysis",
            "Implement corrective and preventive action plans",
            "Review and update all quality assurance procedures",
            "Train staff on new protocols and procedures",
            "Monitor market response and consumer feedback"
          ],
          communicationPlan: {
            pressRelease: `We are issuing an immediate voluntary recall of ${data.affectedProducts.join(', ')} due to a potential ${data.crisisType} issue. Consumer safety is our top priority, and we are working closely with regulatory authorities to resolve this matter quickly.`,
            customerNotice: `Important Safety Notice: We have identified a potential ${data.crisisType} issue with ${data.affectedProducts.join(', ')}. Please discontinue use immediately and contact us for a full refund.`,
            regulatoryNotice: `Regulatory Compliance Alert: We are reporting a ${data.severity} severity ${data.crisisType} incident affecting ${data.affectedProducts.length} product(s) in ${data.affectedMarkets.join(', ')} markets. Full documentation and corrective action plans will be submitted within required timeframes.`
          },
          legalCompliance: {
            requirements: [
              "Submit incident report to FDA within 24 hours",
              "Notify all affected retailers and distributors",
              "Maintain detailed records of all actions taken",
              "Comply with local food safety regulations in each market",
              "Prepare for potential regulatory inspection"
            ],
            deadlines: [
              "FDA notification: Within 24 hours",
              "Retailer notification: Within 48 hours", 
              "Public communication: Within 72 hours",
              "Root cause analysis: Within 7 days",
              "Corrective action plan: Within 14 days"
            ],
            contacts: [
              "FDA Emergency Response Team",
              "Local Health Department",
              "Legal Counsel - Food Safety Division",
              "Crisis Management Consultant",
              "Insurance Claims Representative"
            ]
          }
        }
      };
      
      setCrisisAnalysis(analysis);
      setCrisisStep('results');
    } catch (error) {
      console.error('Error analyzing crisis:', error);
      setCrisisStep('form');
    }
  };

  const handleExportCrisisReport = () => {
    if (!crisisAnalysis) return;
    
    const reportData = {
      timestamp: new Date().toISOString(),
      crisis: crisisAnalysis
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crisis-report-${crisisAnalysis.crisisType}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleNewCrisisReport = () => {
    setCrisisData(null);
    setCrisisAnalysis(null);
    setCrisisStep('form');
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta label?')) {
      return;
    }

    try {
      const response = await fetch(`https://zdsrl1mlbg.execute-api.us-east-1.amazonaws.com/Prod/labels/${labelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the label from the local state
        setLabels(prevLabels => prevLabels.filter(label => label.labelId !== labelId));
        alert('Label deletada com sucesso!');
      } else {
        throw new Error('Erro ao deletar label');
      }
    } catch (error) {
      console.error('Error deleting label:', error);
      alert('Erro ao deletar label. Tente novamente.');
    }
  };

  const handleDownloadPDF = async (label: any) => {
    try {
      // Create a simple PDF-like document using HTML and print
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Não foi possível abrir a janela de impressão. Verifique se o popup está bloqueado.');
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Label - ${label.productName || 'Product'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 15px;
            }
            .section h3 {
              color: #333;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .info-item {
              background: #f5f5f5;
              padding: 8px;
              border-radius: 4px;
            }
            .nutrition-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .nutrition-table th,
            .nutrition-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .nutrition-table th {
              background-color: #f2f2f2;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Smart Label - ${label.productName || 'Product'}</h1>
            <p>Market: ${label.market || 'N/A'} | Language: ${label.language || 'EN'}</p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h3>Product Information</h3>
            <div class="info-grid">
              <div class="info-item"><strong>Product:</strong> ${label.productName || 'N/A'}</div>
              <div class="info-item"><strong>Market:</strong> ${label.market || 'N/A'}</div>
              <div class="info-item"><strong>Language:</strong> ${label.language || 'N/A'}</div>
              <div class="info-item"><strong>Created:</strong> ${label.createdAt ? new Date(label.createdAt).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>

          ${label.labelData?.legalLabel ? `
          <div class="section">
            <h3>Legal Label Information</h3>
            ${label.labelData.legalLabel.ingredients ? `<p><strong>Ingredients:</strong> ${label.labelData.legalLabel.ingredients}</p>` : ''}
            ${label.labelData.legalLabel.allergens ? `<p><strong>Allergens:</strong> ${label.labelData.legalLabel.allergens}</p>` : ''}
            
            ${label.labelData.legalLabel.nutrition ? `
            <h4>Nutrition Information</h4>
            <table class="nutrition-table">
              <thead>
                <tr><th>Nutrient</th><th>Value</th></tr>
              </thead>
              <tbody>
                ${Object.entries(label.labelData.legalLabel.nutrition).map(([key, value]) => {
                  // Handle nested nutrition structure (e.g., {per100g: {value: 50, unit: "g"}})
                  let displayValue: string = '';
                  
                  if (typeof value === 'object' && value !== null) {
                    const objValue = value as any;
                    
                    // Check for nested structure like {per100g: {value: 50, unit: "g"}}
                    if (objValue.per100g && typeof objValue.per100g === 'object') {
                      const per100g = objValue.per100g;
                      if (per100g.value !== undefined && per100g.unit !== undefined) {
                        displayValue = `${per100g.value}${per100g.unit}`;
                      } else if (per100g.value !== undefined) {
                        displayValue = String(per100g.value);
                      } else {
                        displayValue = JSON.stringify(per100g);
                      }
                    }
                    // Check for direct value/unit structure
                    else if (objValue.value !== undefined && objValue.unit !== undefined) {
                      displayValue = `${objValue.value}${objValue.unit}`;
                    } else if (objValue.value !== undefined) {
                      displayValue = String(objValue.value);
                    } else if (objValue.amount !== undefined) {
                      displayValue = String(objValue.amount);
                    } else {
                      displayValue = JSON.stringify(value);
                    }
                  } else {
                    displayValue = String(value);
                  }
                  
                  return `<tr><td>${key}</td><td>${displayValue}</td></tr>`;
                }).join('')}
              </tbody>
            </table>
            ` : ''}
          </div>
          ` : ''}

          ${label.labelData?.marketing ? `
          <div class="section">
            <h3>Marketing Information</h3>
            ${label.labelData.marketing.short ? `<p><strong>Short Description:</strong> ${label.labelData.marketing.short}</p>` : ''}
            ${label.labelData.marketing.long ? `<p><strong>Long Description:</strong> ${label.labelData.marketing.long}</p>` : ''}
            ${label.labelData.marketing.claims ? `<p><strong>Claims:</strong> ${label.labelData.marketing.claims}</p>` : ''}
          </div>
          ` : ''}

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              🖨️ Print as PDF
            </button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/smartlabel-logo.svg" 
                alt="SmartLabel AI Logo" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold">SmartLabel AI</h1>
                <p className="text-sm text-gray-400">Intelligent Label Generation</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowCrisis(true)}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                ⚡ Crisis Response
              </button>
              
              <button
                onClick={() => {
                  setShowCrisis(false);
                  setCurrentStep('labels');
                }}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                📋 View Labels
              </button>
              
              <button
                onClick={() => {
                  setShowCrisis(false);
                  setCurrentStep('form');
                }}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                + Create New Label
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCrisis ? (
          <>
            {crisisStep === 'form' && (
              <CrisisResponseForm
                onSubmit={handleCrisisSubmit}
                isProcessing={false}
              />
            )}
            
            {crisisStep === 'analyzing' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-400 mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Analyzing Crisis Situation</h2>
              <p className="text-gray-300 mb-6">
                      Our AI is analyzing the crisis data and generating a comprehensive response plan...
                    </p>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div>✓ Validating crisis data</div>
                      <div>✓ Assessing risk levels</div>
                      <div>⏳ Generating action plans</div>
                      <div>⏳ Preparing communication strategies</div>
                    </div>
                  </div>
            </div>
          </div>
            )}
            
            {crisisStep === 'results' && crisisAnalysis && (
              <CrisisAnalysisResults
                analysis={crisisAnalysis}
                onGenerateNew={handleNewCrisisReport}
                onExportReport={handleExportCrisisReport}
              />
            )}
          </>
        ) : (
          <>
            {currentStep === 'form' && (
              <div className="max-w-6xl mx-auto">
                <EnhancedProductForm
                  onSubmit={handleFormSubmit}
                  isGenerating={false}
                />
              </div>
            )}

            {currentStep === 'generating' && (
              <div className="max-w-4xl mx-auto">
                <SimpleGenerationTrace />
              </div>
            )}

            {currentStep === 'comparison' && (
              <div className="w-full">
                <EnhancedComparisonLayout onGenerateNew={handleGenerateNew} />
              </div>
            )}

            {currentStep === 'labels' && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Your Smart Labels</h2>
                    <p className="text-gray-400">View and manage all your generated labels</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={loadExistingLabels}
                      className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                    >
                      🔄 Refresh
                    </button>
                    <button
                      onClick={handleGenerateNew}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      + Create New Label
                    </button>
                  </div>
                </div>
                
                {labels.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No labels yet</h3>
                    <p className="text-gray-500 mb-4">Create your first smart label to get started</p>
                    <button
                      onClick={handleGenerateNew}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create Your First Label
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {labels.map((label, index) => (
                      <div key={label.labelId || index} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {label.productName || 'Unknown Product'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                🌍 {label.market}
                              </span>
                              <span className="flex items-center gap-1">
                                📅 {label.createdAt ? new Date(label.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                🏷️ {label.language?.toUpperCase() || 'EN'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const dataStr = JSON.stringify(label, null, 2);
                                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                const url = URL.createObjectURL(dataBlob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `${label.productName || 'label'}_${label.market}.json`;
                                link.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                            >
                              📄 JSON
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(label)}
                              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors"
                            >
                              📄 PDF
                            </button>
                            <button
                              onClick={() => handleDeleteLabel(label.labelId!)}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-gray-300 mb-2">Legal Label</h4>
                            <p className="text-gray-400 mb-1">
                              <strong>Ingredients:</strong> {label.labelData?.legalLabel?.ingredients || 'N/A'}
                            </p>
                            <p className="text-gray-400 mb-1">
                              <strong>Allergens:</strong> {label.labelData?.legalLabel?.allergens || 'None specified'}
                            </p>
                            <div className="text-gray-400">
                              <strong>Nutrition:</strong>
                              {label.labelData?.legalLabel?.nutrition ? (
                                typeof label.labelData.legalLabel.nutrition === 'object' ? (
                                  <div className="ml-2 mt-1 space-y-1">
                                    {Object.entries(label.labelData.legalLabel.nutrition).map(([key, value]) => {
                                      // Debug: Log the nutrition data structure
                                      console.log(`Nutrition display - Key: ${key}, Value:`, value);
                                      
                                      // Handle nested nutrition structure (e.g., {per100g: {value: 50, unit: "g"}})
                                      let displayValue: string = '';
                                      
                                      if (typeof value === 'object' && value !== null) {
                                        const objValue = value as any;
                                        
                                        // Check for nested structure like {per100g: {value: 50, unit: "g"}}
                                        if (objValue.per100g && typeof objValue.per100g === 'object') {
                                          const per100g = objValue.per100g;
                                          if (per100g.value !== undefined && per100g.unit !== undefined) {
                                            displayValue = `${per100g.value}${per100g.unit}`;
                                          } else if (per100g.value !== undefined) {
                                            displayValue = String(per100g.value);
                                          } else {
                                            displayValue = JSON.stringify(per100g);
                                          }
                                        }
                                        // Check for direct value/unit structure
                                        else if (objValue.value !== undefined && objValue.unit !== undefined) {
                                          displayValue = `${objValue.value}${objValue.unit}`;
                                        } else if (objValue.value !== undefined) {
                                          displayValue = String(objValue.value);
                                        } else if (objValue.amount !== undefined) {
                                          displayValue = String(objValue.amount);
                                        } else if (objValue.text !== undefined) {
                                          displayValue = objValue.text;
                                        } else {
                                          displayValue = JSON.stringify(value);
                                        }
                                      } else {
                                        displayValue = String(value);
                                      }
                                      
                                      return (
                                        <div key={key} className="text-sm">
                                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {displayValue}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="ml-2">{label.labelData.legalLabel.nutrition}</span>
                                )
                              ) : (
                                <span className="ml-2">N/A</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-300 mb-2">Marketing</h4>
                            <p className="text-gray-400 mb-1">
                              <strong>Short:</strong> {label.labelData?.marketing?.short || 'N/A'}
                            </p>
                            <p className="text-gray-400 mb-1">
                              <strong>Long:</strong> {label.labelData?.marketing?.long || 'N/A'}
                            </p>
                            <p className="text-gray-400">
                              <strong>Claims:</strong> {label.labelData?.marketing?.claims || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>SmartLabel AI - Powered by Advanced AI Technology</p>
            <p className="text-sm mt-2">
              Generate compliant labels for multiple markets with intelligent automation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}