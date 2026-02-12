import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AlertBadge from './AlertBadge';
import ConfidenceBadge from './ConfidenceBadge';

const ComplianceGauge = ({ compositeIndex, alertLevel, confidence, regulatoryCategory }) => {
  // Add null checks and default values
  const safeCompositeIndex = compositeIndex || 0;
  const safeConfidence = confidence || 0;
  const percentage = (safeCompositeIndex * 100).toFixed(1);
  
  const getColor = () => {
    if (safeCompositeIndex < 0.3) return '#22c55e'; // green
    if (safeCompositeIndex < 0.6) return '#eab308'; // yellow
    if (safeCompositeIndex < 0.8) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const data = [
    { value: safeCompositeIndex * 100 },
    { value: 100 - safeCompositeIndex * 100 },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
            >
              <Cell fill={getColor()} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center mt-8">
            <p className="text-4xl font-bold" style={{ color: getColor() }}>
              {percentage}%
            </p>
            <p className="text-sm text-gray-600">Composite Index</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Alert Level:</span>
          <AlertBadge level={alertLevel} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Category:</span>
          <span className="text-sm font-medium text-gray-900">{regulatoryCategory}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Confidence:</span>
          <ConfidenceBadge confidence={confidence} />
        </div>
      </div>
    </div>
  );
};

export default ComplianceGauge;
