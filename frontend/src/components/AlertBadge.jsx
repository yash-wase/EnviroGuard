import React from 'react';

const AlertBadge = ({ level }) => {
  const getStyles = () => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStyles()}`}>
      {level || 'Unknown'}
    </span>
  );
};

export default AlertBadge;
