import React, { useState } from 'react';
import AlertBadge from './AlertBadge';
import { ArrowUpDown } from 'lucide-react';

const RankingTable = ({ rankings, selectedIndustry, onSelectIndustry }) => {
  const [sortField, setSortField] = useState('Rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterLevel, setFilterLevel] = useState('all');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredRankings = rankings.filter(item => {
    if (filterLevel === 'all') return true;
    return item.Alert_Level?.toLowerCase() === filterLevel.toLowerCase();
  });

  const sortedRankings = [...filteredRankings].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'number') {
      return (aVal - bVal) * modifier;
    }
    return String(aVal).localeCompare(String(bVal)) * modifier;
  });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Industry Rankings</h3>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Levels</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Rank')}
              >
                <div className="flex items-center space-x-1">
                  <span>Rank</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Industry_ID')}
              >
                <div className="flex items-center space-x-1">
                  <span>Industry ID</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Composite_Index')}
              >
                <div className="flex items-center space-x-1">
                  <span>Composite Index</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alert Level
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('Average_Risk_Pct')}
              >
                <div className="flex items-center space-x-1">
                  <span>Avg Risk %</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRankings.map((item) => (
              <tr
                key={item.Industry_ID}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedIndustry === item.Industry_ID ? 'bg-primary-50' : ''
                }`}
                onClick={() => onSelectIndustry(item.Industry_ID)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.Rank}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {item.Industry_ID}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {item.Composite_Index?.toFixed(3)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <AlertBadge level={item.Alert_Level} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {item.Average_Risk_Pct?.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTable;
