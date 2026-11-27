import api from './api';

export const historyService = {
  /**
   * Get user's chronological activity timeline with filtering
   */
  async getHistory(params = {}) {
    return await api.get('/history', { params });
  },

  /**
   * Toggle favorite / bookmark status on any history entry or document
   */
  async toggleFavorite(id) {
    return await api.post(`/history/favorite/${id}`);
  },

  /**
   * Get all bookmarked / starred items for quick 1-click access
   */
  async getFavorites() {
    return await api.get('/history/favorites');
  },

  /**
   * Clear user activity timeline (preserves favorites by default)
   */
  async clearHistory(includeFavorites = false) {
    return await api.delete('/history/clear', { data: { includeFavorites } });
  },
};

export default historyService;
