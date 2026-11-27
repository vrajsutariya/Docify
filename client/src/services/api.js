import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120s default timeout for heavy AI document operations
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
  async (error) => {
    // If response is a Blob containing error JSON, parse it
    let serverMessage = error.response?.data?.message;
    if (!serverMessage && error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text);
        serverMessage = parsed.message;
      } catch (_) {}
    }

    // If 401 Unauthorized occurs on protected routes (not login/register)
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register') ||
        error.config?.url?.includes('/auth/guest');

      const token = localStorage.getItem('docify_token');
      const isGuestToken = token?.startsWith('guest_demo_token');

      if (!isAuthEndpoint && !isGuestToken) {
        localStorage.removeItem('docify_token');
        localStorage.removeItem('docify_user');
      }
    }

    let message = serverMessage || error.message || 'An unexpected error occurred.';
    if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      message = 'Document processing timed out. Large or scanned PDFs may take longer to process. Please retry or upload an optimized PDF.';
    } else if (error.code === 'ERR_NETWORK' || message === 'Network Error') {
      message = 'Backend API server unreachable (http://localhost:5000). Please ensure server is running.';
    }

    const errorPayload = {
      success: false,
      message,
    };
    return Promise.reject(errorPayload);
  }
);

export default api;
