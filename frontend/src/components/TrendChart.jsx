import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api/apiClient';
import Loader from './Loader';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TrendChart = ({ industryId }) => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrend = async () => {
      if (!industryId) return;
      
      try {
        setLoading(true);
        const response = await api.getTrend(industryId);
        if (response.data.success) {
          setTrendData(response.data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [industryId]);

  if (loading) return <Loader message="Loading trend data..." />;
  if (error) return <div className="card text-red-600">Error: {error}</div>;
  if (!trendData || !trendData.trend_data || trendData.trend_data.length === 0) {
    return <div className="card text-gray-600">No trend data available. Run predictions multiple times to generate trends.</div>;
  }

  const chartData = trendData.trend_data.map(item => ({
    date: new Date(item.Date).toLocaleDateString(),
    index: item.Composite_Index,
  }));

  const getTrendIcon = () => {
    if (trendData.trend_direction === 'improving') {
      return <TrendingDown className="w-5 h-5 text-green-600" />;
    } else if (trendData.trend_direction === 'worsening') {
      return <TrendingUp className="w-5 h-5 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Historical Trend</h3>
        {trendData.trend_direction && (
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${
              trendData.trend_direction === 'improving' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trendData.trend_direction.charAt(0).toUpperCase() + trendData.trend_direction.slice(1)}
            </span>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="index" stroke="#16a34a" strokeWidth={2} name="Composite Index" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
