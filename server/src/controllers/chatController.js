import { Document } from '../models/Document.js';
import { findRelevantChunks, generateRAGResponse } from '../services/ragService.js';
import { successResponse, errorResponse } from '../utils/responseWrapper.js';

/**
 * Interactive Chat with Document (RAG)
 * POST /api/documents/chat
 */
export const askQuestion = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.currentUser?._id;
    if (!userId) {
      return errorResponse(res, 'Authentication required to query documents.', 401);
    }

    const { documentIds, documentId, question, language = 'en' } = req.body;

    // Normalize documentIds array
    let targetDocIds = [];
    if (Array.isArray(documentIds)) {
      targetDocIds = documentIds.filter(Boolean);
    } else if (typeof documentIds === 'string' && documentIds.trim()) {
      targetDocIds = documentIds.split(',').map((id) => id.trim()).filter(Boolean);
    } else if (documentId) {
      targetDocIds = [documentId];
    }

    if (targetDocIds.length === 0) {
      return errorResponse(res, 'At least one valid documentId must be selected for chat.', 400);
    }

    if (!question || typeof question !== 'string' || !question.trim()) {
      return errorResponse(res, 'A valid question text is required.', 400);
    }

    // Validate ownership of documents
    const authorizedDocs = await Document.find({
      _id: { $in: targetDocIds },
      userId,
    }).select('_id originalName');

    if (!authorizedDocs || authorizedDocs.length === 0) {
      return errorResponse(
        res,
        'Selected document(s) were not found or you do not have permission to access them.',
        404
      );
    }

    const authorizedDocIds = authorizedDocs.map((d) => d._id.toString());

    // Step 1: Retrieve top-k relevant chunks across all selected authorized documents
    const { chunks: relevantChunks, maxScore } = await findRelevantChunks(
      question.trim(),
      authorizedDocIds,
      4
    );

    // Step 2: Generate grounded RAG response with strictly enforced citations
    const ragResult = await generateRAGResponse(
      question.trim(),
      relevantChunks,
      language
    );

    return successResponse(
      res,
      {
        answer: ragResult.answer,
        citedPages: ragResult.citedPages || [],
        confidence: ragResult.confidence || 0.8,
        relevantChunks: ragResult.relevantChunks || [],
        searchedDocCount: authorizedDocIds.length,
      },
      'Response generated successfully',
      200
    );
  } catch (error) {
    console.error('[chatController] Error processing document chat question:', error);
    return errorResponse(
      res,
      error.message || 'An error occurred while generating document chat answer.',
      500,
      error
    );
  }
};

export default {
  askQuestion,
};
