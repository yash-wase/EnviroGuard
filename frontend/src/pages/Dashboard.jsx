import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmissionCard from '../components/EmissionCard';
import ComplianceGauge from '../components/ComplianceGauge';
import RiskVsTarget from '../components/RiskVsTarget';
import TrendChart from '../components/TrendChart';
import SeverityChart from '../components/SeverityChart';

const Dashboard = () => {
  const { predictionData, selectedIndustry } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!predictionData || !predictionData.predictions || predictionData.predictions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-6">Please upload a dataset to view predictions.</p>
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

  const { forecast, risk_vs_target, severity_ranking, composite_index, alert_level, confidence, regulatory_category } = currentPrediction;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Top Section - Emission Cards + Compliance Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            {/* 4 Emission Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmissionCard
                pollutant="CO2"
                value={forecast.CO2}
                riskPercentage={risk_vs_target.CO2.Risk_Pct}
                unit="kg"
              />
              <EmissionCard
                pollutant="SO2"
                value={forecast.SO2}
                riskPercentage={risk_vs_target.SO2.Risk_Pct}
                unit="kg"
              />
              <EmissionCard
                pollutant="BOD"
                value={forecast.BOD}
                riskPercentage={risk_vs_target.BOD.Risk_Pct}
                unit="mg/L"
              />
              <EmissionCard
                pollutant="COD"
                value={forecast.COD}
                riskPercentage={risk_vs_target.COD.Risk_Pct}
                unit="mg/L"
              />
            </div>

            {/* Compliance Gauge */}
            <div className="lg:col-span-2">
              <ComplianceGauge
                compositeIndex={composite_index}
                alertLevel={alert_level}
                confidence={confidence}
                regulatoryCategory={regulatory_category}
              />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskVsTarget riskData={risk_vs_target} />
            <SeverityChart severityRanking={severity_ranking} />
          </div>

          {/* Trend Chart */}
          <div className="mt-6">
            <TrendChart industryId={currentPrediction.industry_id} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Industries</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictionData.summary.Total_Industries}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {predictionData.summary.Critical_Count}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Moderate</p>
              <p className="text-2xl font-bold text-yellow-600">
                {predictionData.summary.Moderate_Count}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Low Risk</p>
              <p className="text-2xl font-bold text-green-600">
                {predictionData.summary.Low_Count}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
