import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  getSystemStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getActivityLogs,
  getStorageAnalytics,
  cleanupStorage,
} from '../controllers/adminController.js';

const router = Router();

// Apply auth & admin check to all admin routes
router.use(requireAuth, requireAdmin);

// System telemetry & metrics
router.get('/stats', getSystemStats);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Audit logs
router.get('/logs', getActivityLogs);

// Storage management & garbage collection
router.get('/storage', getStorageAnalytics);
router.post('/cleanup-storage', cleanupStorage);

export default router;
