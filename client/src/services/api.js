/**
 * API Service for LedgerLens AML Platform
 * Handles all communication with the FastAPI backend
 */

import axios from 'axios';

// Base URL - update for production deployment
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth (future use)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Upload and analyze CSV
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Load sample dataset
  getSampleData: async () => {
    const response = await api.get('/sample/');
    return response.data;
  },

  // Get transactions with pagination and filtering
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions/', { params });
    return response.data;
  },

  // Get transaction statistics
  getTransactionStats: async () => {
    const response = await api.get('/transactions/stats', { params: {} });
    return response.data;
  },

  // Get alerts
  getAlerts: async (params = {}) => {
    const response = await api.get('/alerts/', { params });
    return response.data;
  },

  // Get alerts summary
  getAlertsSummary: async () => {
    const response = await api.get('/alerts/summary', { params: {} });
    return response.data;
  },

  // Dismiss alert
  dismissAlert: async (alertId) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
  },

  // Get AI insights
  getInsights: async () => {
    const response = await api.get('/insights/');
    return response.data;
  },

  // Regenerate insights
  regenerateInsights: async () => {
    const response = await api.post('/insights/regenerate', {});
    return response.data;
  },

  // Analyze transaction data (alternative to upload)
  analyzeTransactions: async (transactions) => {
    const response = await api.post('/analyze/', { transactions });
    return response.data;
  },
};

export default apiService;