import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL, HTTP_STATUS, ERROR_MESSAGES } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    // Reduced logging for production

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata?.startTime;
    // Reduced logging for production

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Don't log canceled requests as errors (they're intentional)
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || error.message === 'canceled') {
      return Promise.reject(error);
    }
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // Token expired or invalid
          if (data.message?.includes('expired') || data.message?.includes('invalid')) {
            await handleTokenRefresh(originalRequest);
            return api(originalRequest);
          }
          
          // Clear auth data and redirect to login
          clearAuthData();
          window.location.href = '/login';
          toast.error('Session expired. Please log in again.');
          break;
          
        case HTTP_STATUS.FORBIDDEN:
          toast.error(data.message || ERROR_MESSAGES.FORBIDDEN);
          break;
          
        case HTTP_STATUS.NOT_FOUND:
          toast.error(data.message || ERROR_MESSAGES.RESOURCE_NOT_FOUND);
          break;
          
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          toast.error(data.message || ERROR_MESSAGES.RATE_LIMITED);
          break;
          
        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
          // Validation errors - don't show toast, let component handle it
          break;
          
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          toast.error(data.message || ERROR_MESSAGES.SERVER_ERROR);
          break;
          
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
          toast.error('Service temporarily unavailable. Please try again later.');
          break;
          
        default:
          if (status >= 500) {
            toast.error(ERROR_MESSAGES.SERVER_ERROR);
          }
      }
    } else if (error.request) {
      // Network error (but not canceled)
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
        console.error('Network Error:', error.request);
        toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      }
    } else {
      // Something else happened (but not canceled)
      if (error.message !== 'canceled') {
        console.error('Request Setup Error:', error.message);
        toast.error('An unexpected error occurred');
      }
    }

    return Promise.reject(error);
  }
);

// Token refresh handler
const handleTokenRefresh = async (originalRequest) => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken },
      { withCredentials: true }
    );

    const { token, refreshToken: newRefreshToken } = response.data.data;

    // Update stored tokens
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', newRefreshToken);

    // Update the original request with new token
    originalRequest.headers.Authorization = `Bearer ${token}`;
    
    return token;
  } catch (refreshError) {
    console.error('Token refresh failed:', refreshError);
    clearAuthData();
    window.location.href = '/login';
    throw refreshError;
  }
};

// Clear authentication data
const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};

// Helper functions for different HTTP methods
export const apiRequest = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

// File upload helper
export const uploadFile = (url, formData, onProgress = null) => {
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      }
    },
  });
};

// Download file helper
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return response;
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download file');
    throw error;
  }
};

// Batch request helper
export const batchRequest = async (requests) => {
  try {
    const responses = await Promise.allSettled(
      requests.map(request => api(request))
    );
    
    return responses.map((result, index) => ({
      index,
      status: result.status,
      data: result.status === 'fulfilled' ? result.value.data : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  } catch (error) {
    console.error('Batch request failed:', error);
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Cancel token helper
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// Check if error is due to cancellation
export const isCancel = (error) => {
  return axios.isCancel(error);
};

export default api;