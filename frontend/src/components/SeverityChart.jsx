import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SeverityChart = ({ severityRanking }) => {
  if (!severityRanking || severityRanking.length === 0) return null;

  const getColor = (percentage) => {
    if (percentage < 30) return '#22c55e';
    if (percentage < 60) return '#eab308';
    if (percentage < 80) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Ranking</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={severityRanking} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="pollutant" type="category" />
          <Tooltip />
          <Bar dataKey="percentage" name="% of Limit">
            {severityRanking.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeverityChart;
