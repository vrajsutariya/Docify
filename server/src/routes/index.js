import { Router } from 'express';
import { successResponse } from '../utils/responseWrapper.js';
import authRoutes from './authRoutes.js';

const router = Router();

// Mount Auth Sub-router
router.use('/auth', authRoutes);

// Root API Health & Meta
router.get('/health', (req, res) => {
  return successResponse(
    res,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      modules: ['DocuMind', 'DataInsight', 'SmartTools'],
    },
    'Docify API Server is operational'
  );
});

export default router;
