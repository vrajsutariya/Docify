import api from './api';

/**
 * Fetch or generate 3-level abstraction summary
 * @param {string} docId - MongoDB document ID
 * @param {'all' | 'short' | 'medium' | 'detailed'} [depth='all']
 * @param {'en' | 'gu' | 'hi'} [language='en']
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<{ success: boolean, data: Object, message: string }>}
 */
export const getSummary = async (docId, depth = 'all', language = 'en', forceRefresh = false) => {
  return await api.post(`/documents/${docId}/summarize`, {
    depth,
    language,
    forceRefresh,
  });
};

/**
 * Fetch entity extraction (People, Organizations, Dates, Metrics, Keywords)
 * @param {string} docId
 * @returns {Promise<{ success: boolean, data: { people: string[], organizations: string[], dates: string[], metrics: string[], keywords: string[] } }>}
 */
export const getKeyInfo = async (docId) => {
  return await api.get(`/documents/${docId}/key-info`);
};

/**
 * Fetch tone sentiment and domain categorization
 * @param {string} docId
 * @returns {Promise<{ success: boolean, data: { sentiment: Object, category: Object } }>}
 */
export const getSentiment = async (docId) => {
  return await api.get(`/documents/${docId}/sentiment`);
};

/**
 * Translate summary into Gujarati, Hindi, or English
 * @param {string} docId
 * @param {'en' | 'gu' | 'hi'} targetLang
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<{ success: boolean, data: { targetLang: string, short: string, medium: string[], detailed: string } }>}
 */
export const translateSummary = async (docId, targetLang = 'gu', forceRefresh = false) => {
  return await api.post(`/documents/${docId}/translate`, {
    targetLang,
    forceRefresh,
  });
};

export default {
  getSummary,
  getKeyInfo,
  getSentiment,
  translateSummary,
};
