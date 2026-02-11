import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-12 h-12 text-primary-600" />,
      title: 'Real-time Monitoring',
      description: 'Track industrial emissions with 97% accuracy using advanced ML models.',
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-primary-600" />,
      title: 'Predictive Analytics',
      description: 'Forecast next month emissions and identify risks before they occur.',
    },
    {
      icon: <AlertTriangle className="w-12 h-12 text-primary-600" />,
      title: 'Compliance Management',
      description: 'Automated alerts and regulatory compliance tracking for all industries.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            EnviroGuard
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Industrial Emission Intelligence Platform
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Leverage AI-powered analytics to monitor, predict, and optimize industrial emissions.
            Ensure regulatory compliance and environmental sustainability.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Start Monitoring
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card hover:shadow-lg transition-shadow text-center"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">97%</div>
            <div className="text-gray-600">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">4</div>
            <div className="text-gray-600">Pollutants Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-gray-600">Real-time Monitoring</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2024 EnviroGuard. Industrial Emission Intelligence Platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
