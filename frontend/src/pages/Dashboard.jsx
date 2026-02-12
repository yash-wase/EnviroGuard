import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import RiskVsTarget from '../components/RiskVsTarget';
import ComplianceGauge from '../components/ComplianceGauge';

const Dashboard = () => {
  const { predictionData, selectedIndustry } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!predictionData || !predictionData.predictions || predictionData.predictions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-6">Please upload a dataset to view predictions.</p>
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

  const { forecast, risk_vs_target, composite_index, alert_level, confidence, regulatory_category } = currentPrediction;

  const getEmissionColor = (riskPct) => {
    if (riskPct >= 100) return 'text-red-600';
    if (riskPct >= 80) return 'text-orange-600';
    if (riskPct >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (riskPct) => {
    if (riskPct >= 100) return 'bg-red-500';
    if (riskPct >= 80) return 'bg-orange-500';
    if (riskPct >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (riskPct) => {
    if (riskPct >= 100) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6 mt-16">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Emission Overview</h2>
            <p className="text-sm text-gray-600 mt-1">AI-predicted emission levels and composite risk assessment for infratech</p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left: 2x2 Emission Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {/* CO2 Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-600 uppercase">CO2</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(risk_vs_target.CO2.Risk_Pct)}
                    <span className={`text-xs font-semibold ${getEmissionColor(risk_vs_target.CO2.Risk_Pct)}`}>
                      {risk_vs_target.CO2.Risk_Pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{forecast.CO2.toFixed(2)}</div>
                <div className="text-xs text-gray-600 mb-3">tonnes/yr</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Limit: 500 tonnes/yr</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${getProgressColor(risk_vs_target.CO2.Risk_Pct)}`} style={{ width: `${Math.min(risk_vs_target.CO2.Risk_Pct, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* SO2 Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-600 uppercase">SO2</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(risk_vs_target.SO2.Risk_Pct)}
                    <span className={`text-xs font-semibold ${getEmissionColor(risk_vs_target.SO2.Risk_Pct)}`}>
                      {risk_vs_target.SO2.Risk_Pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{forecast.SO2.toFixed(2)}</div>
                <div className="text-xs text-gray-600 mb-3">kg/yr</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Limit: 80 kg/yr</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${getProgressColor(risk_vs_target.SO2.Risk_Pct)}`} style={{ width: `${Math.min(risk_vs_target.SO2.Risk_Pct, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* BOD Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-600 uppercase">BOD</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(risk_vs_target.BOD.Risk_Pct)}
                    <span className={`text-xs font-semibold ${getEmissionColor(risk_vs_target.BOD.Risk_Pct)}`}>
                      {risk_vs_target.BOD.Risk_Pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{forecast.BOD.toFixed(2)}</div>
                <div className="text-xs text-gray-600 mb-3">mg/L</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Limit: 30 mg/L</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${getProgressColor(risk_vs_target.BOD.Risk_Pct)}`} style={{ width: `${Math.min(risk_vs_target.BOD.Risk_Pct, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* COD Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-600 uppercase">COD</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(risk_vs_target.COD.Risk_Pct)}
                    <span className={`text-xs font-semibold ${getEmissionColor(risk_vs_target.COD.Risk_Pct)}`}>
                      {risk_vs_target.COD.Risk_Pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{forecast.COD.toFixed(2)}</div>
                <div className="text-xs text-gray-600 mb-3">mg/L</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Limit: 250 mg/L</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${getProgressColor(risk_vs_target.COD.Risk_Pct)}`} style={{ width: `${Math.min(risk_vs_target.COD.Risk_Pct, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Emission Index */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xs font-medium text-gray-600 uppercase mb-6 text-center">EMISSION INDEX</h3>
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                    <circle 
                      cx="96" 
                      cy="96" 
                      r="88" 
                      fill="none" 
                      stroke={composite_index < 0.4 ? '#10b981' : composite_index < 0.7 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="12"
                      strokeDasharray={`${composite_index * 553} 553`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{(composite_index * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  composite_index < 0.4 ? 'bg-green-100 text-green-700' :
                  composite_index < 0.7 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {composite_index < 0.4 ? 'Low' : composite_index < 0.7 ? 'Moderate' : 'Risk'}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-600">Confidence: <span className="font-semibold text-gray-900">{confidence.toFixed(1)}%</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compliance Score */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Compliance Score</h3>
              <ComplianceGauge 
                compositeIndex={composite_index} 
                alertLevel={alert_level}
                confidence={confidence}
                regulatoryCategory={regulatory_category}
              />
            </div>

            {/* Risk vs Regulatory Limit */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Risk vs Regulatory Limit</h3>
              <RiskVsTarget riskData={risk_vs_target} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
