import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Generate 8-character alphanumeric company ID
const generateCompanyId = (companyName) => {
  if (!companyName) return null;
  
  // Create hash from company name
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    const char = companyName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to alphanumeric (8 chars)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  let num = Math.abs(hash);
  
  for (let i = 0; i < 8; i++) {
    id += chars[num % chars.length];
    num = Math.floor(num / chars.length);
    if (num === 0) num = Math.abs(hash) + i; // Ensure we always get 8 chars
  }
  
  return id;
};

export const AppProvider = ({ children }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [rankingData, setRankingData] = useState(null);
  const [guidelinesData, setGuidelinesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate company ID when company name is set
  const updateCompanyName = (name) => {
    setCompanyName(name);
    if (name) {
      const id = generateCompanyId(name);
      setCompanyId(id);
    } else {
      setCompanyId(null);
    }
  };

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
    companyName,
    companyId,
    updateCompanyName,
    uploadProgress,
    setUploadProgress,
    isProcessing,
    setIsProcessing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
