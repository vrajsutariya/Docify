import api from './api';

/**
 * Upload a document file with real-time upload progress tracking
 * @param {File} file - Browser File object
 * @param {Function} [onProgressCallback] - Callback receiving integer percent 0..100
 * @returns {Promise<{ success: boolean, data: Object, message: string }>}
 */
export const uploadFile = async (file, onProgressCallback) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 5 minutes timeout for large PDF upload, parsing, and OCR
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgressCallback) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgressCallback(percentCompleted);
      }
    },
  });

  return response;
};

/**
 * Fetch paginated list of user's uploaded documents
 * @param {Object} [params] - { page, limit, search, fileType, sortBy, sortOrder }
 * @returns {Promise<{ success: boolean, data: { documents: Array, total: number, page: number, totalPages: number } }>}
 */
export const getUserDocuments = async (params = {}) => {
  return await api.get('/documents', { params });
};

/**
 * Fetch a single document by its MongoDB ObjectId
 * @param {string} id
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const getDocumentById = async (id) => {
  return await api.get(`/documents/${id}`);
};

/**
 * Delete a document by its MongoDB ObjectId
 * @param {string} id
 * @returns {Promise<{ success: boolean, data: { id: string }, message: string }>}
 */
export const deleteDocument = async (id) => {
  return await api.delete(`/documents/${id}`);
};

/**
 * Formats raw byte count into human-readable string (KB, MB, GB)
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default {
  uploadFile,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  formatBytes,
};
