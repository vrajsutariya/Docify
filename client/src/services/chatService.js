import api from './api';

/**
 * Ask a question across one or multiple documents using conversational ChatGPT-grade RAG
 * @param {string[] | string} documentIds - Single ID or array of document IDs
 * @param {string} question - User question text
 * @param {'en' | 'gu' | 'hi'} [language='en'] - Preferred answer language
 * @param {Array<Object>} [conversationHistory=[]] - Multi-turn conversation messages
 * @returns {Promise<any>}
 */
export const askDocumentQuestion = async (
  documentIds,
  question,
  language = 'en',
  conversationHistory = []
) => {
  const docIdArray = Array.isArray(documentIds)
    ? documentIds
    : [documentIds].filter(Boolean);

  return await api.post('/documents/chat', {
    documentIds: docIdArray,
    question: question.trim(),
    language,
    conversationHistory,
  });
};

export default {
  askDocumentQuestion,
};
