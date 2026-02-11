import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { api } from '../api/apiClient';
import Loader from '../components/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, AlertCircle } from 'lucide-react';

const CounterMeasures = () => {
  const { predictionData, selectedIndustry, uploadedFilename } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    Production_Volume: 1.0,
    Treatment_Efficiency: 80,
    Operating_Hours: 1.0,
  });

  if (!predictionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <button onClick={() => navigate('/upload')} className="btn-primary">
            Upload Dataset
          </button>
        </div>
      </div>
    );
  }

  const currentPrediction = predictionData.predictions.find(
    (p) => p.industry_id === selectedIndustry
  ) || predictionData.predictions[0];

  const { recommendation, composite_index } = currentPrediction;

  const handleSimulate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const modifications = {
        Production_Volume: parseFloat(formData.Production_Volume),
        Treatment_Efficiency: parseFloat(formData.Treatment_Efficiency),
        Operating_Hours: parseFloat(formData.Operating_Hours),
      };
      
      const response = await api.simulate(uploadedFilename || 'master_training_dataset.csv', modifications);
      
      if (response.data.success) {
        setSimulationResult(response.data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const comparisonData = simulationResult ? [
    {
      name: 'Current',
      CO2: simulationResult.comparisons[0]?.Baseline_CO2 || 0,
      SO2: simulationResult.comparisons[0]?.Baseline_SO2 || 0,
      BOD: simulationResult.comparisons[0]?.Baseline_BOD || 0,
      COD: simulationResult.comparisons[0]?.Baseline_COD || 0,
    },
    {
      name: 'Simulated',
      CO2: simulationResult.comparisons[0]?.Scenario_CO2 || 0,
      SO2: simulationResult.comparisons[0]?.Scenario_SO2 || 0,
      BOD: simulationResult.comparisons[0]?.Scenario_BOD || 0,
      COD: simulationResult.comparisons[0]?.Scenario_COD || 0,
    },
  ] : [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Counter Measures & Mitigation</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Composite Index</p>
                  <p className="text-3xl font-bold text-gray-900">{(composite_index * 100).toFixed(1)}%</p>
                </div>

                {recommendation?.primary_driver && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Primary Driver</p>
                    <p className="text-lg font-medium text-gray-900">{recommendation.primary_driver}</p>
                  </div>
                )}

                {recommendation?.action && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Recommended Action</p>
                    <p className="text-gray-900">{recommendation.action}</p>
                  </div>
                )}

                {recommendation?.mitigation_impact && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-900">Projected Impact</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Current Index</p>
                        <p className="font-medium text-gray-900">
                          {(recommendation.mitigation_impact.current_index * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Projected Index</p>
                        <p className="font-medium text-green-600">
                          {(recommendation.mitigation_impact.projected_index * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Improvement</p>
                        <p className="font-medium text-green-600">
                          {recommendation.mitigation_impact.improvement_percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Simulation Form */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulate Scenario</h3>
              
              <form onSubmit={handleSimulate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Production Volume Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.Production_Volume}
                    onChange={(e) => setFormData({ ...formData, Production_Volume: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">1.0 = current, 1.1 = 10% increase</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Efficiency (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.Treatment_Efficiency}
                    onChange={(e) => setFormData({ ...formData, Treatment_Efficiency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Hours Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.Operating_Hours}
                    onChange={(e) => setFormData({ ...formData, Operating_Hours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">1.0 = current, 0.9 = 10% decrease</p>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full btn-primary">
                  {loading ? 'Simulating...' : 'Run Simulation'}
                </button>
              </form>
            </div>
          </div>

          {/* Simulation Results */}
          {loading && <Loader message="Running simulation..." />}
          
          {simulationResult && !loading && (
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Results</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="CO2" fill="#ef4444" name="CO2 (kg)" />
                  <Bar dataKey="SO2" fill="#f97316" name="SO2 (kg)" />
                  <Bar dataKey="BOD" fill="#eab308" name="BOD (mg/L)" />
                  <Bar dataKey="COD" fill="#22c55e" name="COD (mg/L)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CounterMeasures;
