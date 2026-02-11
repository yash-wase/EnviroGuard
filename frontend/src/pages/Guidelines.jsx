import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import Loader from '../components/Loader';
import { AlertCircle, Info } from 'lucide-react';

const Guidelines = () => {
  const { guidelinesData, setGuidelinesData, predictionData, selectedIndustry } = useApp();
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Regulatory Guidelines</h2>

          {loading && <Loader message="Loading guidelines..." />}
          
          {error && (
            <div className="card">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && guidelinesData && (
            <div className="space-y-6">
              {/* Current Industry Classification */}
              {currentPrediction && (
                <div className="card bg-primary-50 border border-primary-200">
                  <div className="flex items-start space-x-3">
                    <Info className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-2">
                        Current Industry: {currentPrediction.industry_id}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-primary-700">Regulatory Category:</p>
                          <p className="font-semibold text-primary-900">
                            {currentPrediction.regulatory_category}
                          </p>
                        </div>
                        <div>
                          <p className="text-primary-700">Alert Level:</p>
                          <p className="font-semibold text-primary-900">
                            {currentPrediction.alert_level}
                          </p>
                        </div>
                        <div>
                          <p className="text-primary-700">Composite Index:</p>
                          <p className="font-semibold text-primary-900">
                            {(currentPrediction.composite_index * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-primary-700">Confidence:</p>
                          <p className="font-semibold text-primary-900">
                            {currentPrediction.confidence.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Regulatory Limits */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Limits</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pollutant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Limit
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(guidelinesData.regulatory_limits).map(([pollutant, limit]) => (
                        <tr key={pollutant}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{pollutant}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{limit}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {pollutant === 'CO2' || pollutant === 'SO2' ? 'kg' : 'mg/L'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Composite Weights */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Composite Index Weights</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pollutant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Weight
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(guidelinesData.composite_weights).map(([pollutant, weight]) => (
                        <tr key={pollutant}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{pollutant}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{weight}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{(weight * 100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alert Levels */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Level Thresholds</h3>
                <div className="space-y-3">
                  {Object.entries(guidelinesData.alert_levels).map(([level, threshold]) => (
                    <div key={level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 capitalize">{level}</span>
                      <span className="text-gray-600">{threshold}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Categories */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Categories</h3>
                <div className="space-y-3">
                  {Object.entries(guidelinesData.regulatory_categories).map(([category, threshold]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 capitalize">{category}</span>
                      <span className="text-gray-600">{threshold}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Levels */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Quality Levels</h3>
                <div className="space-y-3">
                  {Object.entries(guidelinesData.quality_levels).map(([level, threshold]) => (
                    <div key={level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 capitalize">{level.replace('_', ' ')}</span>
                      <span className="text-gray-600">{threshold}</span>
                    </div>
                  ))}
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
