import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  createQuiz,
  getQuizById,
  getQuizByShareId,
  submitQuizAttempt,
  updateFlashcardProgress,
  exportQuiz,
  getQuizzesByDocument,
} from '../controllers/quizController.js';

const router = Router();

// 1. Generate Quiz (Protected)
router.post('/generate', requireAuth, createQuiz);

// 2. Get Quizzes by Document (Protected)
router.get('/document/:docId', requireAuth, getQuizzesByDocument);

// 3. Public Shared Quiz by shareId (No authentication required)
router.get('/share/:shareId', getQuizByShareId);

// 4. Export Quiz sheet (Public/Protected)
router.get('/:id/export', exportQuiz);

// 5. Submit Quiz Attempt (Protected - Optional auth handled gracefully)
router.post('/:id/attempt', (req, res, next) => {
  // Try requireAuth, if fails still allow attempt with null userId for public quiz takers
  requireAuth(req, res, () => next()).catch(() => next());
}, submitQuizAttempt);

// 6. Update Flashcard Box Progress (Protected)
router.post('/:id/flashcards/progress', requireAuth, updateFlashcardProgress);

// 7. Get Quiz by ID (Protected)
router.get('/:id', requireAuth, getQuizById);

export default router;
