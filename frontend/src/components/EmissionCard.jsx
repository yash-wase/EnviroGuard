import { Cloud, Droplet, Waves, Factory } from 'lucide-react';

const EmissionCard = ({ pollutant, value, riskPercentage, unit }) => {
  const getIcon = () => {
    switch (pollutant) {
      case 'CO2':
        return <Cloud className="w-6 h-6" />;
      case 'SO2':
        return <Factory className="w-6 h-6" />;
      case 'BOD':
        return <Droplet className="w-6 h-6" />;
      case 'COD':
        return <Waves className="w-6 h-6" />;
      default:
        return <Cloud className="w-6 h-6" />;
    }
  };

  const getRiskColor = () => {
    if (riskPercentage < 30) return 'text-green-600 bg-green-50';
    if (riskPercentage < 60) return 'text-yellow-600 bg-yellow-50';
    if (riskPercentage < 80) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskBorderColor = () => {
    if (riskPercentage < 30) return 'border-green-200';
    if (riskPercentage < 60) return 'border-yellow-200';
    if (riskPercentage < 80) return 'border-orange-200';
    return 'border-red-200';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 border-l-4 ${getRiskBorderColor()} h-full flex flex-col justify-between`}>
      <div className="flex items-center space-x-2 mb-3">
        <div className={`p-1.5 rounded-lg ${getRiskColor()}`}>
          {getIcon()}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{pollutant}</h3>
      </div>
      
      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900">
          {value?.toFixed(2)}
        </p>
        <p className="text-xs text-gray-600">{unit}</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              riskPercentage < 30
                ? 'bg-green-500'
                : riskPercentage < 60
                ? 'bg-yellow-500'
                : riskPercentage < 80
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(riskPercentage, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-700">
          {riskPercentage?.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default EmissionCard;
