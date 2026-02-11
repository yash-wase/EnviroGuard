import React from 'react';
import { Menu, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { selectedIndustry } = useApp();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emission Intelligence</h1>
            {selectedIndustry && (
              <p className="text-sm text-gray-600">Industry: {selectedIndustry}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center space-x-2 btn-primary"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Dataset</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
