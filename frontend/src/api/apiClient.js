import axios from 'axios';

const API_BASE_URL = 'http://localhost:4001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An error occurred';
    
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 400) {
        errorMessage = data.error || 'Bad request';
      } else if (status === 404) {
        errorMessage = data.error || 'Resource not found';
      } else if (status === 422) {
        errorMessage = data.error || 'Validation error';
      } else if (status === 500) {
        errorMessage = data.error || 'Internal server error';
      } else {
        errorMessage = data.error || `Error ${status}`;
      }
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
    } else {
      // Error in request setup
      errorMessage = error.message;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// API methods
export const api = {
  // Health check
  health: () => apiClient.get('/api/health'),
  
  // Predict - upload CSV (with longer timeout for large files)
  predict: (file) => {
    const formData = new FormData();
    formData.append('dataset', file);
    return apiClient.post('/api/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout
    });
  },
  
  // Simulate scenario
  simulate: (datasetFilename, modifications) => {
    return apiClient.post('/api/simulate', {
      dataset_filename: datasetFilename,
      modifications,
    });
  },
  
  // Get ranking
  getRanking: () => apiClient.get('/api/ranking'),
  
  // Get trend for industry
  getTrend: (industryId) => apiClient.get(`/api/trend/${industryId}`),
  
  // Get guidelines
  getGuidelines: () => apiClient.get('/api/guidelines'),
};

export default apiClient;
