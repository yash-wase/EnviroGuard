import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, AlertCircle } from 'lucide-react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import Loader from '../components/Loader';

const Upload = () => {
  const navigate = useNavigate();
  const { setPredictionData, setSelectedIndustry, setUploadedFilename } = useApp();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.predict(file);
      
      if (response.data.success) {
        const data = response.data.data;
        setPredictionData(data);
        setUploadedFilename(file.name);
        
        // Set first industry as selected
        if (data.predictions && data.predictions.length > 0) {
          setSelectedIndustry(data.predictions[0].industry_id);
        }
        
        navigate('/dashboard');
      } else {
        setError(response.data.error || 'Prediction failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
        {/* Left Side - Illustration */}
        <div className="hidden md:flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Your Dataset
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Upload your industrial emission dataset to get instant predictions and insights.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Select CSV File</h4>
                <p className="text-gray-600">Choose your emission dataset file</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Upload & Analyze</h4>
                <p className="text-gray-600">Our AI processes your data instantly</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">View Insights</h4>
                <p className="text-gray-600">Get predictions and recommendations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Upload Card */}
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Upload Dataset</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {file ? (
                  <>
                    <FileText className="w-16 h-16 text-primary-600 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your CSV file here
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      or click to browse
                    </p>
                    <span className="btn-secondary">Select File</span>
                  </>
                )}
              </label>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <Loader message="Processing dataset... This may take 30-60 seconds for large files." />
            ) : (
              <button
                type="submit"
                disabled={!file}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload and Analyze
              </button>
            )}
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Supported file format: CSV. Maximum file size: 200MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
