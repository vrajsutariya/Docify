import api from './api';

export const authService = {
  /**
   * Log in user with email and password
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  /**
   * Register a new user account
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response;
  },

  /**
   * Update user preferences (language, theme)
   */
  async updatePreferences(preferences) {
    const response = await api.put('/auth/preferences', preferences);
    return response;
  },

  /**
   * Logout helper (clears tokens from storage)
   */
  logout() {
    localStorage.removeItem('docify_token');
    localStorage.removeItem('docify_user');
  },
};

export default authService;
