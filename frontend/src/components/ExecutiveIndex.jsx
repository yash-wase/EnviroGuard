const ExecutiveIndex = ({ compositeIndex, alertLevel }) => {
  const percentage = (compositeIndex * 100).toFixed(1);
  
  const getColor = () => {
    if (compositeIndex < 0.4) return { 
      border: 'border-green-500', 
      fill: 'rgba(34, 197, 94, 0.15)', 
      numberText: 'text-green-700',
      labelBg: 'bg-green-500',
      labelText: 'text-white',
      label: 'Low Risk' 
    };
    if (compositeIndex < 0.7) return { 
      border: 'border-yellow-500', 
      fill: 'rgba(234, 179, 8, 0.15)', 
      numberText: 'text-yellow-700',
      labelBg: 'bg-yellow-500',
      labelText: 'text-white',
      label: 'Moderate' 
    };
    if (compositeIndex < 0.9) return { 
      border: 'border-amber-500', 
      fill: 'rgba(245, 158, 11, 0.15)', 
      numberText: 'text-amber-700',
      labelBg: 'bg-amber-500',
      labelText: 'text-white',
      label: 'High Risk' 
    };
    return { 
      border: 'border-red-500', 
      fill: 'rgba(239, 68, 68, 0.15)', 
      numberText: 'text-red-700',
      labelBg: 'bg-red-500',
      labelText: 'text-white',
      label: 'Critical' 
    };
  };

  const colors = getColor();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 h-full flex flex-col items-center justify-center min-h-[400px]">
      <h3 className="text-base font-semibold text-gray-600 mb-8 uppercase tracking-wide">
        Executive Emission Index
      </h3>
      
      {/* Circle Container - Larger */}
      <div className="relative w-56 h-56 mb-8">
        {/* Outer Circle with Border and fainter transparency fill */}
        <div 
          className={`absolute inset-0 rounded-full border-4 ${colors.border} flex items-center justify-center`}
          style={{ backgroundColor: colors.fill }}
        >
          {/* Inner Content */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${colors.numberText}`}>
              {percentage}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Label - Solid background with white text */}
      <div className={`px-8 py-3 rounded-full ${colors.labelBg} ${colors.labelText} font-semibold text-base`}>
        {colors.label}
      </div>
      
      {/* Alert Level */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Alert Status</p>
        <p className="text-base font-medium text-gray-900 mt-1">{alertLevel}</p>
      </div>
    </div>
  );
};

export default ExecutiveIndex;
