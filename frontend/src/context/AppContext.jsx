import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [rankingData, setRankingData] = useState(null);
  const [guidelinesData, setGuidelinesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);

  const value = {
    predictionData,
    setPredictionData,
    selectedIndustry,
    setSelectedIndustry,
    rankingData,
    setRankingData,
    guidelinesData,
    setGuidelinesData,
    loading,
    setLoading,
    error,
    setError,
    uploadedFilename,
    setUploadedFilename,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
