import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { api } from '../api/apiClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CounterMeasures = () => {
  const { predictionData, selectedIndustry, uploadedFilename } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    Production_Volume: 1.0,
    Treatment_Efficiency: 1.0,
    Operating_Hours: 1.0,
    Fuel_Type: 'Coal'
  });

  if (!predictionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <button onClick={() => navigate('/upload')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold">
            Upload Dataset
          </button>
        </div>
      </div>
    );
  }

  const currentPrediction = predictionData.predictions.find(
    (p) => p.industry_id === selectedIndustry
  ) || predictionData.predictions[0];

  const { recommendation, composite_index, forecast } = currentPrediction;
  
  // Find highest risk pollutant
  const pollutants = [
    { name: 'CO2', value: forecast.CO2, limit: 5000, risk: (forecast.CO2 / 5000) * 100 },
    { name: 'SO2', value: forecast.SO2, limit: 80, risk: (forecast.SO2 / 80) * 100 },
    { name: 'BOD', value: forecast.BOD, limit: 250, risk: (forecast.BOD / 250) * 100 },
    { name: 'COD', value: forecast.COD, limit: 500, risk: (forecast.COD / 500) * 100 }
  ];
  
  const highestRisk = pollutants.reduce((max, p) => p.risk > max.risk ? p : max, pollutants[0]);

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
      BOD: simulationResult.comparisons[0]?.Baseline_BOD || 0,
      COD: simulationResult.comparisons[0]?.Scenario_COD || 0,
    },
  ] : [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6 mt-16">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Counter Measures</h2>
            <p className="text-sm text-gray-600 mt-1">Risk assessment, mitigation strategies, and operational simulation</p>
          </div>

          {/* Highest Risk Pollutant Banner */}
          <div className="bg-white rounded-lg border-l-4 border-orange-500 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Highest Risk Pollutant</p>
                  <p className="text-2xl font-bold text-gray-900">{highestRisk.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">Risk Level</p>
                  <p className="text-xl font-bold text-orange-600">{highestRisk.risk.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">Classification</p>
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm font-semibold">Risk</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">Confidence</p>
                  <p className="text-xl font-bold text-gray-900">{currentPrediction.confidence.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Mitigation Strategies */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Mitigation Strategies</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Strategy 1 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">High</span>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">Efficiency Optimization</h4>
                <p className="text-sm text-gray-600 mb-3">Implement process optimization to increase treatment efficiency and reduce waste per unit produced.</p>
                <p className="text-xs text-gray-500">Expected Impact: <span className="font-semibold text-gray-700">Medium</span></p>
              </div>

              {/* Strategy 2 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">High</span>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">Emission Control Equipment</h4>
                <p className="text-sm text-gray-600 mb-3">Install scrubbers, filters, or catalytic converters to reduce air pollutant emissions.</p>
                <p className="text-xs text-gray-500">Expected Impact: <span className="font-semibold text-gray-700">Medium</span></p>
              </div>

              {/* Strategy 3 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600">Medium</span>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">Waste Heat Recovery</h4>
                <p className="text-sm text-gray-600 mb-3">Capture and reuse waste heat to reduce overall energy consumption and associated emissions.</p>
                <p className="text-xs text-gray-500">Expected Impact: <span className="font-semibold text-gray-700">Medium</span></p>
              </div>
            </div>
          </div>

          {/* Operational Simulation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Operational Simulation</h3>
            
            <form onSubmit={handleSimulate}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {/* Production Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Production</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={formData.Production_Volume}
                    onChange={(e) => setFormData({ ...formData, Production_Volume: e.target.value })}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0.5x</span>
                    <span className="font-semibold text-gray-900">{formData.Production_Volume}x</span>
                    <span>2.0x</span>
                  </div>
                </div>

                {/* Efficiency Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Efficiency</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={formData.Treatment_Efficiency}
                    onChange={(e) => setFormData({ ...formData, Treatment_Efficiency: e.target.value })}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0.5x</span>
                    <span className="font-semibold text-gray-900">{formData.Treatment_Efficiency}x</span>
                    <span>2.0x</span>
                  </div>
                </div>

                {/* Operating Hours Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={formData.Operating_Hours}
                    onChange={(e) => setFormData({ ...formData, Operating_Hours: e.target.value })}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0.5x</span>
                    <span className="font-semibold text-gray-900">{formData.Operating_Hours}x</span>
                    <span>2.0x</span>
                  </div>
                </div>

                {/* Fuel Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                  <select
                    value={formData.Fuel_Type}
                    onChange={(e) => setFormData({ ...formData, Fuel_Type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="Coal">Coal</option>
                    <option value="Natural Gas">Natural Gas</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Biomass">Biomass</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loading ? 'Running Simulation...' : 'Run Simulation'}
              </button>
            </form>

            {/* Simulation Results */}
            {simulationResult && !loading && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Simulation Results</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="CO2" fill="#ef4444" name="CO2" />
                    <Bar dataKey="SO2" fill="#f97316" name="SO2" />
                    <Bar dataKey="BOD" fill="#eab308" name="BOD" />
                    <Bar dataKey="COD" fill="#22c55e" name="COD" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CounterMeasures;
