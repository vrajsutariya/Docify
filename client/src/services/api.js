import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('docify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent response formatting & error handling
api.interceptors.response.use(
  (response) => {
    // Return standard response structure
    return response.data;
  },
  (error) => {
    // If 401 Unauthorized occurs on protected routes (not login/register)
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('docify_token');
        localStorage.removeItem('docify_user');
      }
    }

    const errorPayload = error.response?.data || {
      success: false,
      message: error.message || 'An unexpected network error occurred.',
    };
    return Promise.reject(errorPayload);
  }
);

export default api;
