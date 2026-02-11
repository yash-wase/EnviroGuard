import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import RankingTable from '../components/RankingTable';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import Loader from '../components/Loader';
import { AlertCircle } from 'lucide-react';

const Ranking = () => {
  const navigate = useNavigate();
  const { rankingData, setRankingData, setSelectedIndustry } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!rankingData) {
      fetchRanking();
    }
  }, [rankingData, setRankingData]);

  const handleSelectIndustry = (industryId) => {
    setSelectedIndustry(industryId);
    navigate('/dashboard');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Industry Rankings</h2>

          {loading && <Loader message="Loading rankings..." />}
          
          {error && (
            <div className="card">
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
                <div className="card">
                  <p className="text-sm text-gray-600 mb-1">Total Industries</p>
                  <p className="text-3xl font-bold text-gray-900">{rankingData.registry_size}</p>
                </div>
                <div className="card">
                  <p className="text-sm text-gray-600 mb-1">Top 5 Risky</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rankingData.top_5_risky?.slice(0, 3).map((id) => (
                      <span key={id} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <p className="text-sm text-gray-600 mb-1">Safe Industries</p>
                  <p className="text-3xl font-bold text-green-600">
                    {rankingData.safe_industries?.length || 0}
                  </p>
                </div>
                <div className="card">
                  <p className="text-sm text-gray-600 mb-1">Avg Composite Index</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {rankingData.ranking && rankingData.ranking.length > 0
                      ? (
                          rankingData.ranking.reduce((sum, item) => sum + item.Composite_Index, 0) /
                          rankingData.ranking.length
                        ).toFixed(3)
                      : '0.000'}
                  </p>
                </div>
              </div>

              {/* Ranking Table */}
              <RankingTable
                rankings={rankingData.ranking || []}
                selectedIndustry={null}
                onSelectIndustry={handleSelectIndustry}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Ranking;
