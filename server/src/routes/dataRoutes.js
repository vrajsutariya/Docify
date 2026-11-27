import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleSingleUpload } from '../middleware/uploadMiddleware.js';
import {
  uploadDataset,
  getUserDatasets,
  getDatasetById,
  cleanDataset,
  askData,
  getAnomalies,
  getReport,
  exportCleanedData,
  deleteDataset,
} from '../controllers/dataController.js';

const router = Router();

// Ingest dataset (file upload or Google Sheets URL)
router.post('/upload', requireAuth, handleSingleUpload('file'), uploadDataset);

// Get user datasets
router.get('/', requireAuth, getUserDatasets);

// Dataset details, preview rows, and schema
router.get('/:id', requireAuth, getDatasetById);

// One-Click Auto-Clean Pipeline (SRS Item 3)
router.post('/:id/clean', requireAuth, cleanDataset);

// Ask Questions with Formula Transparency (SRS Item 2)
router.post('/:id/ask', requireAuth, askData);

// Anomaly & Outlier Detection (SRS Item 4)
router.get('/:id/anomalies', requireAuth, getAnomalies);

// AI Insight Executive Report (SRS Item 5)
router.get('/:id/report', requireAuth, getReport);

// Export Cleaned CSV / Excel
router.get('/:id/export', requireAuth, exportCleanedData);

// Delete Dataset
router.delete('/:id', requireAuth, deleteDataset);

export default router;
