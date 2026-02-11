import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RiskVsTarget = ({ riskData }) => {
  if (!riskData) return null;

  const chartData = Object.entries(riskData).map(([pollutant, data]) => ({
    pollutant,
    Predicted: data.Predicted,
    Limit: data.Limit,
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk vs Regulatory Limits</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="pollutant" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Limit" fill="#22c55e" name="Regulatory Limit" />
          <Bar dataKey="Predicted" fill="#ef4444" name="Predicted Emission" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskVsTarget;
