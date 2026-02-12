import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyName, companyId } = useApp();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 h-16">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isDashboard && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <button 
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            EnviroGuard
          </button>
        </div>

        {isDashboard && companyName && (
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">{companyName}</p>
            <p className="text-xs text-gray-500 font-mono">{companyId}</p>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
