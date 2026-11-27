import api from './api';

/**
 * Upload dataset file (CSV, XLSX, XLS, JSON) or import via Google Sheets URL
 * Supports passing pre-parsed rows from browser SheetJS / PapaParse
 * @param {File | { sheetUrl: string }} input
 * @param {Array<Object>} [parsedRows] - Optional pre-parsed row records from browser
 */
export const uploadDataset = async (input, parsedRows = null) => {
  if (input instanceof File) {
    const formData = new FormData();
    formData.append('file', input);
    if (parsedRows && Array.isArray(parsedRows) && parsedRows.length > 0) {
      formData.append('parsedRows', JSON.stringify(parsedRows));
    }
    return await api.post('/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Google Sheets or URL payload
  return await api.post('/data/upload', input);
};

/**
 * Get all datasets for the authenticated user
 */
export const getUserDatasets = async () => {
  return await api.get('/data');
};

/**
 * Get dataset details, schema, and paginated rows
 * @param {string} datasetId
 * @param {number} [page=1]
 * @param {number} [limit=100]
 */
export const getDatasetById = async (datasetId, page = 1, limit = 100) => {
  return await api.get(`/data/${datasetId}`, {
    params: { page, limit },
  });
};

/**
 * Trigger One-Click Auto-Clean pipeline
 * @param {string} datasetId
 * @param {Object} [options]
 */
export const cleanDataset = async (datasetId, options = {}) => {
  return await api.post(`/data/${datasetId}/clean`, { options });
};

/**
 * Ask Questions in Natural Language with Formula Transparency
 * @param {string} datasetId
 * @param {string} question
 * @param {'en' | 'gu' | 'hi'} [language='en']
 * @param {Array<Object>} [activeRows] - Optional active/cleaned records from DataInsight state
 */
export const askDataQuestion = async (datasetId, question, language = 'en', activeRows = null) => {
  return await api.post(`/data/${datasetId}/ask`, {
    question,
    language,
    activeRows: activeRows && Array.isArray(activeRows) && activeRows.length > 0 ? activeRows : undefined,
  });
};

/**
 * Detect outliers and anomalies
 * @param {string} datasetId
 * @param {string} [column]
 */
export const getAnomalies = async (datasetId, column) => {
  return await api.get(`/data/${datasetId}/anomalies`, {
    params: { column },
  });
};

/**
 * Generate AI Insight Executive Report in EN, GU, or HI
 * @param {string} datasetId
 * @param {'en' | 'gu' | 'hi'} [language='en']
 */
export const getDatasetReport = async (datasetId, language = 'en') => {
  return await api.get(`/data/${datasetId}/report`, {
    params: { language },
  });
};

/**
 * Download cleaned CSV or Excel file
 * @param {string} datasetId
 * @param {'csv' | 'xlsx'} [format='csv']
 */
export const exportDatasetFile = async (datasetId, format = 'csv') => {
  const response = await api.get(`/data/${datasetId}/export`, {
    params: { format },
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type: format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `cleaned-dataset.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Delete dataset
 * @param {string} datasetId
 */
export const deleteDataset = async (datasetId) => {
  return await api.delete(`/data/${datasetId}`);
};

export default {
  uploadDataset,
  getUserDatasets,
  getDatasetById,
  cleanDataset,
  askDataQuestion,
  getAnomalies,
  getDatasetReport,
  exportDatasetFile,
  deleteDataset,
};
