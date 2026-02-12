import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api/apiClient';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const TrendChart = ({ industryId }) => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrend = async () => {
      if (!industryId) {
        setLoading(false);
        setError('No industry ID provided');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.getTrend(industryId);
        
        if (response.data.success) {
          setTrendData(response.data.data);
        } else {
          setError(response.data.error || 'Failed to load trend data');
        }
      } catch (err) {
        console.error('Trend fetch error:', err);
        setError(err.message || 'Failed to load trend data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [industryId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Trend</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Trend</h3>
        <div className="flex items-center justify-center py-8 text-gray-500">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No trend data available yet</p>
            <p className="text-xs mt-1">Upload and process data multiple times to generate trends</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!trendData || !trendData.trend_data || trendData.trend_data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Trend</h3>
        <div className="flex items-center justify-center py-8 text-gray-500">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No trend data available yet</p>
            <p className="text-xs mt-1">Upload and process data multiple times to generate trends</p>
          </div>
        </div>
      </div>
    );
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
    <div className="bg-white rounded-xl shadow-lg p-6">
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
