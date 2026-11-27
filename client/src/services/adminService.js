import api from './api';

export const adminService = {
  /**
   * Get high-level system telemetry, storage, and 7-day trend metrics
   */
  async getStats() {
    return await api.get('/admin/stats');
  },

  /**
   * Paginated list of registered users with search, role filtering, and sort
   */
  async getUsers(params = {}) {
    return await api.get('/admin/users', { params });
  },

  /**
   * Update user role (user <-> admin)
   */
  async updateUserRole(id, role) {
    return await api.patch(`/admin/users/${id}/role`, { role });
  },

  /**
   * Permanently delete a user and purge associated data
   */
  async deleteUser(id) {
    return await api.delete(`/admin/users/${id}`);
  },

  /**
   * Paginated system audit logs with module/action filters
   */
  async getActivityLogs(params = {}) {
    return await api.get('/admin/logs', { params });
  },

  /**
   * Detailed storage breakdown and list of uploaded files
   */
  async getStorage() {
    return await api.get('/admin/storage');
  },

  /**
   * Trigger cleanup of orphaned files in server uploads/
   */
  async cleanupStorage() {
    return await api.post('/admin/cleanup-storage');
  },
};

export default adminService;
