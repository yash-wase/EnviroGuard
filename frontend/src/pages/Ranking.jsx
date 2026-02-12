import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { AlertCircle, Search } from 'lucide-react';

// Format Industry ID to 8-character code (4 letters + 4 digits)
const formatIndustryId = (id) => {
  if (!id) return 'UNKN0000';
  
  // Convert to string and create hash
  const idStr = String(id);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Generate 4 letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let letterPart = '';
  let num = Math.abs(hash);
  for (let i = 0; i < 4; i++) {
    letterPart += letters[num % 26];
    num = Math.floor(num / 26);
  }
  
  // Generate 4 digits (pad the original ID)
  const digitPart = String(id).padStart(4, '0').slice(-4);
  
  return letterPart + digitPart;
};

const Ranking = () => {
  const navigate = useNavigate();
  const { rankingData, setRankingData, setSelectedIndustry } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getRanking();
        
        if (response.data.success) {
          setRankingData(response.data.data);
        }
      } catch (err) {
        console.error('Ranking fetch error:', err);
        setError(err.message);
        setRankingData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [setRankingData]);

  const handleSelectIndustry = (industryId) => {
    setSelectedIndustry(industryId);
    navigate('/dashboard');
  };

  const getAlertColor = (alertLevel) => {
    if (alertLevel === 'Low') return 'bg-green-100 text-green-800';
    if (alertLevel === 'Moderate') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getIndexColor = (index) => {
    if (index < 0.4) return 'bg-green-500';
    if (index < 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredRankings = rankingData?.ranking?.filter(item => {
    const formattedId = formatIndustryId(item.Industry_ID);
    const matchesSeverity = filterSeverity === 'all' || item.Alert_Level === filterSeverity;
    const matchesSearch = formattedId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(item.Industry_ID).includes(searchTerm);
    return matchesSeverity && matchesSearch;
  }) || [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6 mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Industry Rankings</h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && rankingData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Industries</p>
                  <p className="text-3xl font-bold text-gray-900">{rankingData.registry_size}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-sm text-gray-600 mb-1">Top 5 Risky</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rankingData.top_5_risky?.slice(0, 3).map((id) => (
                      <span key={id} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-mono">
                        {formatIndustryId(id)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-sm text-gray-600 mb-1">Safe Industries</p>
                  <p className="text-3xl font-bold text-green-600">
                    {rankingData.safe_industries?.length || 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-sm text-gray-600 mb-1">Avg Composite Index</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {rankingData.ranking && rankingData.ranking.length > 0
                      ? (
                          rankingData.ranking.reduce((sum, item) => sum + (item.Latest_Composite_Index || 0), 0) /
                          rankingData.ranking.length
                        ).toFixed(3)
                      : '0.000'}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by Industry ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="all">All Severity Levels</option>
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ranking Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Industry ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Composite Index
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alert Level
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRankings.map((item, index) => (
                        <tr key={item.Industry_ID} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-mono font-semibold text-gray-900">
                                {formatIndustryId(item.Industry_ID)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {item.Industry_ID}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getIndexColor(item.Latest_Composite_Index || 0)}`}
                                    style={{ width: `${(item.Latest_Composite_Index || 0) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                                {((item.Latest_Composite_Index || 0) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAlertColor(item.Alert_Level)}`}>
                              {item.Alert_Level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.Confidence?.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.Last_Updated || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleSelectIndustry(item.Industry_ID)}
                              className="text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredRankings.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No industries match your filters
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Ranking;
