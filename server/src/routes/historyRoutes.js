import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getUserHistory,
  toggleFavorite,
  getUserFavorites,
  clearUserHistory,
} from '../controllers/historyController.js';

const router = Router();

// All history routes require user session
router.use(requireAuth);

router.get('/', getUserHistory);
router.post('/favorite/:id', toggleFavorite);
router.get('/favorites', getUserFavorites);
router.delete('/clear', clearUserHistory);

export default router;
