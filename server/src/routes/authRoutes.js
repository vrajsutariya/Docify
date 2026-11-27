import { Router } from 'express';
import {
  register,
  login,
  guestLogin,
  getMe,
  updatePreferences,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.get('/me', requireAuth, getMe);
router.put('/preferences', requireAuth, updatePreferences);
router.put('/profile', requireAuth, updateProfile);
router.put('/password', requireAuth, changePassword);

export default router;
