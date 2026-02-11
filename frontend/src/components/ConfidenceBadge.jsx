import React from 'react';

const ConfidenceBadge = ({ confidence }) => {
  const getStyles = () => {
    if (confidence > 80) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (confidence >= 60) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStyles()}`}>
      {confidence?.toFixed(1)}% Confidence
    </span>
  );
};

export default ConfidenceBadge;
