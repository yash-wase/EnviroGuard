import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';

const Upload = () => {
  const navigate = useNavigate();
  const { setPredictionData, setSelectedIndustry, setUploadedFilename, updateCompanyName, companyName, uploadProgress, setUploadProgress, isProcessing, setIsProcessing } = useApp();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [backendData, setBackendData] = useState(null);

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

  const handleUploadAndProcess = async (e) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      setError('Please enter company name');
      return;
    }

    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setUploadProgress(0);
      setUploadComplete(false);
      
      console.log('Starting upload...', {
        filename: file.name,
        size: file.size,
        type: file.type,
        companyName: companyName
      });
      
      // Immediately start uploading
      const uploadPromise = api.predict(file);
      
      // Animate to 80% while waiting
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(interval);
            return 80;
          }
          return prev + 2;
        });
      }, 100);
      
      // Wait for backend response
      console.log('Waiting for backend response...');
      const response = await uploadPromise;
      clearInterval(interval);
      
      console.log('Backend response received:', response);
      
      if (response.data.success) {
        const data = response.data.data;
        setBackendData(data);
        
        console.log('Upload successful, animating to 100%');
        
        // Animate from 80% to 100%
        let progress = 80;
        const finalInterval = setInterval(() => {
          progress += 4;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(finalInterval);
            setUploadComplete(true);
            setIsProcessing(false);
          }
        }, 50);
        
        setUploadedFilename(file.name);
      } else {
        console.error('Upload failed:', response.data.error);
        setError(response.data.error || 'Prediction failed');
        setIsProcessing(false);
        setUploadProgress(0);
      }
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      
      // More detailed error message
      let errorMessage = 'Upload failed: ';
      if (err.response) {
        errorMessage += err.response.data?.error || err.response.statusText || 'Server error';
      } else if (err.request) {
        errorMessage += 'No response from server. Please check if backend is running on port 4001.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleStartAnalysis = () => {
    if (backendData) {
      setPredictionData(backendData);
      
      // Set first industry as selected
      if (backendData.predictions && backendData.predictions.length > 0) {
        setSelectedIndustry(backendData.predictions[0].industry_id);
      }
      
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-7xl grid md:grid-cols-2 gap-8">
          {/* Left Side - Background Image + Info */}
          <div 
            className="relative rounded-2xl overflow-hidden bg-cover bg-center min-h-[600px] hidden md:flex"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80&fit=crop')`
            }}
          >
            <div className="relative z-10 p-12 flex flex-col justify-center text-white">
              <h2 className="text-4xl font-bold mb-6">Upload Your Dataset</h2>
              <p className="text-lg mb-8 text-gray-200 leading-relaxed">
                Upload your industrial emission dataset to get instant predictions and insights.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-lg">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Enter Company Name</h4>
                    <p className="text-gray-300 text-sm">Unique 8-character ID will be generated</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-lg">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Select CSV File</h4>
                    <p className="text-gray-300 text-sm">Choose your emission dataset file</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-lg">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Upload & Process</h4>
                    <p className="text-gray-300 text-sm">Our AI processes your data instantly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-lg">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Start Analysis</h4>
                    <p className="text-gray-300 text-sm">View predictions and recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Upload Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Upload Dataset</h3>
            
            <form onSubmit={handleUploadAndProcess} className="space-y-6">
              {/* Company Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => updateCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>

              {/* File Dropzone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-300 hover:border-emerald-400'
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
                  disabled={isProcessing}
                />
                
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {file ? (
                    <>
                      <FileText className="w-16 h-16 text-emerald-600 mb-4" />
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
                      <span className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Select File
                      </span>
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

              {/* Upload Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {uploadComplete && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-600">Upload complete! Ready to analyze.</p>
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={!file || !companyName.trim() || isProcessing || uploadComplete}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Upload & Process'}
                </button>

                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={!uploadComplete}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Start Analysis
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Supported file format: CSV. Maximum file size: 200MB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
