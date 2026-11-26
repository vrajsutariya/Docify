import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleSingleUpload } from '../middleware/uploadMiddleware.js';
import {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
} from '../controllers/documentController.js';
import {
  getOrGenerateSummary,
  getKeyInfo,
  getSentimentAndCategory,
  translateDocSummary,
  getMindMap,
  getStudyNotes,
  getCitations,
  getHighlights,
  compareDocuments,
} from '../controllers/documentAiController.js';
import { askQuestion } from '../controllers/chatController.js';

const router = Router();

// Upload document endpoint (protected, single file named 'file')
router.post('/upload', requireAuth, handleSingleUpload('file'), uploadDocument);

// Get current user's documents
router.get('/', requireAuth, getUserDocuments);
router.get('/user', requireAuth, getUserDocuments);

// Document Chat (RAG Engine with Page Citations & Multi-Doc Chat)
router.post('/chat', requireAuth, askQuestion);

// Compare Two Documents Side-by-Side & Plagiarism Check (Prompt 9)
router.post('/compare', requireAuth, compareDocuments);

// Single document retrieval & deletion
router.get('/:id', requireAuth, getDocumentById);
router.delete('/:id', requireAuth, deleteDocument);

// --- DocuMind AI Intelligence Endpoints ---
// 3-Level Abstraction Summary
router.post('/:id/summarize', requireAuth, getOrGenerateSummary);

// Key Entities & Signals Extraction
router.get('/:id/key-info', requireAuth, getKeyInfo);

// Sentiment Tone & Category Detection
router.get('/:id/sentiment', requireAuth, getSentimentAndCategory);

// Multilingual Summary Translation (en, gu, hi)
router.post('/:id/translate', requireAuth, translateDocSummary);

// --- Prompt 9 Research & Study Endpoints ---
// Visual Mind Map Generator (Item 8)
router.get('/:id/mindmap', requireAuth, getMindMap);

// Exam-Ready Study Notes & Bullet Notes (Item 9)
router.get('/:id/notes', requireAuth, getStudyNotes);

// Citation & Reference Extractor (Item 13)
router.get('/:id/citations', requireAuth, getCitations);

// Important Sentences Highlighter (Item 14)
router.get('/:id/highlights', requireAuth, getHighlights);

export default router;
