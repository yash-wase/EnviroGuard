import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { AlertCircle, Info, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Guidelines = () => {
  const { guidelinesData, setGuidelinesData, predictionData, selectedIndustry, companyName, companyId } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getGuidelines();
        
        if (response.data.success) {
          setGuidelinesData(response.data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!guidelinesData) {
      fetchGuidelines();
    }
  }, [guidelinesData, setGuidelinesData]);

  const currentPrediction = predictionData?.predictions?.find(
    (p) => p.industry_id === selectedIndustry
  ) || predictionData?.predictions?.[0];

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text('EnviroGuard Regulatory Guidelines', 14, 20);
    
    // Company Info
    if (companyName && companyId) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Company: ${companyName}`, 14, 30);
      doc.text(`Company ID: ${companyId}`, 14, 37);
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 44);
    
    let yPos = 55;
    
    // Current Industry Classification
    if (currentPrediction) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Current Industry Status', 14, yPos);
      yPos += 10;
      
      doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Industry ID', currentPrediction.industry_id],
          ['Regulatory Category', currentPrediction.regulatory_category],
          ['Alert Level', currentPrediction.alert_level],
          ['Composite Index', `${(currentPrediction.composite_index * 100).toFixed(1)}%`],
          ['Confidence', `${currentPrediction.confidence.toFixed(1)}%`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Regulatory Limits
    if (guidelinesData) {
      doc.setFontSize(14);
      doc.text('Regulatory Limits', 14, yPos);
      yPos += 10;
      
      const limitsData = Object.entries(guidelinesData.regulatory_limits).map(([pollutant, limit]) => [
        pollutant,
        limit.toString(),
        pollutant === 'CO2' || pollutant === 'SO2' ? 'kg' : 'mg/L'
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Pollutant', 'Limit', 'Unit']],
        body: limitsData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // Composite Weights
      doc.setFontSize(14);
      doc.text('Composite Index Weights', 14, yPos);
      yPos += 10;
      
      const weightsData = Object.entries(guidelinesData.composite_weights).map(([pollutant, weight]) => [
        pollutant,
        weight.toString(),
        `${(weight * 100).toFixed(0)}%`
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Pollutant', 'Weight', 'Percentage']],
        body: weightsData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // Alert Levels
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Alert Level Thresholds', 14, yPos);
      yPos += 10;
      
      const alertData = Object.entries(guidelinesData.alert_levels).map(([level, threshold]) => [
        level.charAt(0).toUpperCase() + level.slice(1),
        threshold
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Level', 'Threshold']],
        body: alertData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // Regulatory Categories
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Regulatory Categories', 14, yPos);
      yPos += 10;
      
      const categoryData = Object.entries(guidelinesData.regulatory_categories).map(([category, threshold]) => [
        category.charAt(0).toUpperCase() + category.slice(1),
        threshold
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Category', 'Threshold']],
        body: categoryData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
      });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `EnviroGuard - Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    doc.save(`EnviroGuard_Guidelines_${companyId || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Calculate risk percentages and status for each pollutant
  const getPollutantData = () => {
    if (!currentPrediction || !guidelinesData) return [];
    
    const limits = guidelinesData.regulatory_limits;
    const forecast = currentPrediction.forecast || {};
    
    // Safely get values with fallback to 0
    const co2 = forecast.CO2 || 0;
    const so2 = forecast.SO2 || 0;
    const bod = forecast.BOD || 0;
    const cod = forecast.COD || 0;
    
    return [
      {
        name: 'CO2',
        unit: 'tonnes/yr',
        limit: limits.CO2 || 500,
        predicted: co2,
        riskPercent: limits.CO2 ? ((co2 / limits.CO2) * 100).toFixed(1) : '0.0',
        isCompliant: co2 <= (limits.CO2 || 500)
      },
      {
        name: 'SO2',
        unit: 'kg/yr',
        limit: limits.SO2 || 80,
        predicted: so2,
        riskPercent: limits.SO2 ? ((so2 / limits.SO2) * 100).toFixed(1) : '0.0',
        isCompliant: so2 <= (limits.SO2 || 80)
      },
      {
        name: 'BOD',
        unit: 'mg/L',
        limit: limits.BOD || 30,
        predicted: bod,
        riskPercent: limits.BOD ? ((bod / limits.BOD) * 100).toFixed(1) : '0.0',
        isCompliant: bod <= (limits.BOD || 30)
      },
      {
        name: 'COD',
        unit: 'mg/L',
        limit: limits.COD || 250,
        predicted: cod,
        riskPercent: limits.COD ? ((cod / limits.COD) * 100).toFixed(1) : '0.0',
        isCompliant: cod <= (limits.COD || 250)
      }
    ];
  };

  const pollutantData = getPollutantData();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6 mt-16">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Guidelines & Compliance</h2>
              <p className="text-sm text-gray-600 mt-1">Regulatory limits, classification thresholds, and compliance report export</p>
            </div>
            {guidelinesData && (
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Report</span>
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && guidelinesData && (
            <div className="space-y-6">
              {/* Current Industry Card */}
              {currentPrediction && (
                <div className="bg-white rounded-lg border-l-4 border-emerald-500 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{currentPrediction.industry_id}</h3>
                        <p className="text-xs text-gray-600">{companyId || 'DMFEJWI0'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">Index</p>
                        <p className="text-xl font-bold text-gray-900">{(currentPrediction.composite_index * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                          currentPrediction.composite_index > 0.6 ? 'bg-red-100 text-red-700' : 
                          currentPrediction.composite_index > 0.4 ? 'bg-orange-100 text-orange-700' : 
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {currentPrediction.composite_index > 0.6 ? 'Risk' : 
                           currentPrediction.composite_index > 0.4 ? 'Watchlist' : 
                           'Sustainable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Regulatory Limits Table */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Regulatory Limits</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Pollutant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Regulatory Limit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Current Predicted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Risk %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pollutantData.map((pollutant) => (
                        <tr key={pollutant.name} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{pollutant.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{pollutant.unit}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{pollutant.limit}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{pollutant.predicted.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`font-semibold ${
                              pollutant.isCompliant ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {pollutant.riskPercent}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center space-x-2">
                              {pollutant.isCompliant ? (
                                <>
                                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-emerald-600 font-medium">Compliant</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-red-600 font-medium">Non Compliant</span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Risk Classification Tiers & Index Weight Distribution */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Risk Classification Tiers */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Classification Tiers</h3>
                  <div className="space-y-3">
                    {/* Sustainable */}
                    <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-emerald-700">Sustainable</span>
                        <span className="text-xs text-gray-600">0 - 0.3</span>
                      </div>
                      <p className="text-xs text-gray-600">Emissions well within regulatory limits. Minimal environmental impact.</p>
                    </div>

                    {/* Watchlist */}
                    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-yellow-700">Watchlist</span>
                        <span className="text-xs text-gray-600">0 - 0.6</span>
                      </div>
                      <p className="text-xs text-gray-600">Approaching regulatory thresholds. Proactive monitoring recommended.</p>
                    </div>

                    {/* Risk */}
                    <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-orange-700">Risk</span>
                        <span className="text-xs text-gray-600">0 - 0.8</span>
                      </div>
                      <p className="text-xs text-gray-600">Near or at regulatory limits. Immediate action needed to reduce emissions.</p>
                    </div>

                    {/* Critical */}
                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-red-700">Critical</span>
                        <span className="text-xs text-gray-600">&gt; 0.8</span>
                      </div>
                      <p className="text-xs text-gray-600">Exceeding regulatory limits. Urgent compliance intervention required.</p>
                    </div>
                  </div>
                </div>

                {/* Index Weight Distribution */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Index Weight Distribution</h3>
                  
                  {/* Horizontal Stacked Bar */}
                  <div className="mb-6">
                    <div className="flex h-8 rounded-lg overflow-hidden">
                      <div className="bg-emerald-500 flex items-center justify-center text-white text-xs font-semibold" style={{ width: `${guidelinesData.composite_weights.CO2 * 100}%` }}>
                        CO2
                      </div>
                      <div className="bg-orange-500 flex items-center justify-center text-white text-xs font-semibold" style={{ width: `${guidelinesData.composite_weights.SO2 * 100}%` }}>
                        SO2
                      </div>
                      <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold" style={{ width: `${guidelinesData.composite_weights.BOD * 100}%` }}>
                        BOD
                      </div>
                      <div className="bg-purple-500 flex items-center justify-center text-white text-xs font-semibold" style={{ width: `${guidelinesData.composite_weights.COD * 100}%` }}>
                        COD
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">CO2: <span className="font-semibold">{(guidelinesData.composite_weights.CO2 * 100).toFixed(0)}%</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">SO2: <span className="font-semibold">{(guidelinesData.composite_weights.SO2 * 100).toFixed(0)}%</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">BOD: <span className="font-semibold">{(guidelinesData.composite_weights.BOD * 100).toFixed(0)}%</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">COD: <span className="font-semibold">{(guidelinesData.composite_weights.COD * 100).toFixed(0)}%</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Guidelines;
