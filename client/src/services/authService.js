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
   * Initialize guest session without credentials
   */
  async guestLogin() {
    try {
      const response = await api.post('/auth/guest');
      return response;
    } catch (err) {
      console.warn('[authService] Guest API endpoint unavailable, using offline guest session', err);
      return {
        success: true,
        data: {
          user: {
            _id: 'guest_demo_user',
            name: 'Guest Explorer',
            email: 'guest@docify.demo',
            role: 'user',
            preferredLanguage: 'en',
            theme: 'dark',
          },
          token: 'guest_demo_token_' + Date.now(),
        },
      };
    }
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
   * Update user display name
   */
  async updateProfile(name) {
    const response = await api.put('/auth/profile', { name });
    return response;
  },

  /**
   * Change user password
   */
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/password', { currentPassword, newPassword });
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
