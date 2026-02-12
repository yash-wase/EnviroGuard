import { useNavigate } from 'react-router-dom';
import { Shield, TrendingUp, AlertTriangle, BarChart3, CheckCircle, Activity } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const modules = [
    { name: 'Emission Forecasting', icon: <Activity className="w-6 h-6" /> },
    { name: 'Risk Assessment', icon: <AlertTriangle className="w-6 h-6" /> },
    { name: 'Compliance Tracking', icon: <CheckCircle className="w-6 h-6" /> },
    { name: 'Countermeasures', icon: <TrendingUp className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Professional Background */}
      <div className="relative pt-16 overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}></div>
          {/* Subtle geometric shapes */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-6 py-20 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full text-sm text-emerald-700 font-medium mb-8 shadow-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span>AI-Powered Industrial Emission Intelligence</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight max-w-4xl mx-auto">
            Monitor, Predict, and Reduce Industrial Emissions
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade platform combining multi-output prediction, composite risk indexing, and scenario simulation to transform environmental compliance from reactive to proactive.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Analysis
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 px-8 py-4 rounded-lg text-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Explore Platform
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">4</div>
              <div className="text-sm text-gray-600">Emission Outputs</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">&lt;3s</div>
              <div className="text-sm text-gray-600">Processing Time</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">95%+</div>
              <div className="text-sm text-gray-600">Confidence Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide mb-3">CAPABILITIES</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Emission Intelligence</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Six integrated modules working together to deliver end-to-end environmental compliance monitoring.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Emission Prediction */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Emission Prediction</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Multi-output regression engine predicts CO2, SO2, BOD, and COD emissions using engineered features and historical patterns.
            </p>
          </div>

          {/* Risk Classification */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Classification</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Automated categorization into Sustainable, Watchlist, Risk, or Critical tiers based on composite emission indexing.
            </p>
          </div>

          {/* Scenario Simulation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scenario Simulation</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Adjust production, efficiency, and fuel parameters to forecast the impact of operational changes before implementation.
            </p>
          </div>

          {/* Industry Ranking */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Ranking</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Persistent registry tracks and ranks industries by composite index, enabling cross-sector compliance benchmarking.
            </p>
          </div>

          {/* Trend Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trend Analytics</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Time-series tracking of emission indices reveals compliance trajectories and alerts to emerging risk patterns.
            </p>
          </div>

          {/* Compliance Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Reports</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              One-click PDF export of regulatory compliance reports including predictions, risk levels, and guideline adherence.
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide mb-3">WORKFLOW</p>
            <h2 className="text-4xl font-bold text-gray-900">From Data to Decision in Four Steps</h2>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Connection Line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-gray-200 hidden md:block" style={{ top: '48px' }}></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Step 1 - Upload */}
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto relative z-10">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-2">STEP 01</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload</h3>
                <p className="text-sm text-gray-600">Import industrial operational CSV datasets with one click</p>
              </div>

              {/* Step 2 - Analyze */}
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto relative z-10">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-2">STEP 02</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyze</h3>
                <p className="text-sm text-gray-600">AI engine runs feature engineering and multi-output prediction</p>
              </div>

              {/* Step 3 - Monitor */}
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto relative z-10">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-2">STEP 03</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitor</h3>
                <p className="text-sm text-gray-600">Executive dashboard displays risk indices and compliance gauges</p>
              </div>

              {/* Step 4 - Report */}
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto relative z-10">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-2">STEP 04</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Report</h3>
                <p className="text-sm text-gray-600">Export PDF compliance reports and track improvement trends</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Modules</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                {module.icon}
              </div>
              <span className="font-semibold text-gray-900">{module.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-4">EnviroGuard</h3>
              <p className="text-gray-400 text-sm">
                Industrial Emission Intelligence Platform powered by AI
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => navigate('/upload')} className="hover:text-white">Upload Data</button></li>
                <li><button onClick={() => navigate('/dashboard')} className="hover:text-white">Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">System Info</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Version: 1.0.0</li>
                <li>Port: 4001</li>
                <li>Status: Active</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 EnviroGuard. Industrial Emission Intelligence Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
