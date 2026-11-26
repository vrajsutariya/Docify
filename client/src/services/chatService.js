import api from './api';

/**
 * Ask a question across one or multiple documents using RAG
 * @param {string[] | string} documentIds - Single ID or array of document IDs
 * @param {string} question - User question text
 * @param {'en' | 'gu' | 'hi'} [language='en'] - Preferred answer language
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     answer: string,
 *     citedPages: number[],
 *     confidence: number,
 *     relevantChunks: Array<{ chunkId: string, pageNumber: number, documentId: string, documentName: string, snippet: string, score: number }>
 *   },
 *   message: string
 * }>}
 */
export const askDocumentQuestion = async (documentIds, question, language = 'en') => {
  const docIdArray = Array.isArray(documentIds)
    ? documentIds
    : [documentIds].filter(Boolean);

  return await api.post('/documents/chat', {
    documentIds: docIdArray,
    question: question.trim(),
    language,
  });
};

export default {
  askDocumentQuestion,
};
