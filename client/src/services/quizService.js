import api from './api';

/**
 * Generate a new assessment quiz & flashcards for a document
 * @param {Object} data
 * @param {string} data.documentId
 * @param {number} [data.questionCount=10]
 * @param {'easy' | 'medium' | 'hard'} [data.difficulty='medium']
 * @param {string[]} [data.types=['mcq', 'true_false', 'fill_in_the_blank', 'short_answer']]
 * @param {'en' | 'gu' | 'hi'} [data.language='en']
 * @param {string} [data.pageRange='']
 * @returns {Promise<{ success: boolean, data: Object, message: string }>}
 */
export const generateQuiz = async (data) => {
  return await api.post('/quizzes/generate', data);
};

/**
 * Get quiz details by ID
 * @param {string} id
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const getQuizById = async (id) => {
  return await api.get(`/quizzes/${id}`);
};

/**
 * Get public quiz by shareId
 * @param {string} shareId
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const getQuizByShareId = async (shareId) => {
  return await api.get(`/quizzes/share/${shareId}`);
};

/**
 * Submit quiz answers and receive grading & weak-topic analysis
 * @param {string} id
 * @param {Object} data
 * @param {Record<string, string>} data.answers
 * @param {number} data.timeTakenSeconds
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const submitQuizAttempt = async (id, data) => {
  return await api.post(`/quizzes/${id}/attempt`, data);
};

/**
 * Update flashcard Leitner box level ('know' | 'dont_know')
 * @param {string} id
 * @param {string} cardId
 * @param {'know' | 'dont_know'} action
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const updateFlashcardProgress = async (id, cardId, action) => {
  return await api.post(`/quizzes/${id}/flashcards/progress`, {
    cardId,
    action,
  });
};

/**
 * Fetch all quizzes generated for a specific document
 * @param {string} docId
 * @returns {Promise<{ success: boolean, data: Array<Object> }>}
 */
export const getQuizzesByDocument = async (docId) => {
  return await api.get(`/quizzes/document/${docId}`);
};

/**
 * Get export URL for printable quiz sheet
 * @param {string} id
 * @param {boolean} [includeAnswers=true]
 * @returns {string}
 */
export const getQuizExportUrl = (id, includeAnswers = true) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  return `${baseURL}/quizzes/${id}/export?includeAnswers=${includeAnswers}`;
};

export default {
  generateQuiz,
  getQuizById,
  getQuizByShareId,
  submitQuizAttempt,
  updateFlashcardProgress,
  getQuizzesByDocument,
  getQuizExportUrl,
};
