import path from 'path';
import fs from 'fs';
import { Document } from '../models/Document.js';
import { User } from '../models/User.js';
import { parseDocument } from '../services/documentParserService.js';
import { successResponse, errorResponse } from '../utils/responseWrapper.js';
import { logActivity, recordHistory } from '../services/loggerService.js';

/**
 * Upload and parse a new document
 * POST /api/documents/upload
 */
export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file uploaded. Please select a valid document or image.', 400);
  }

  const userId = req.user?.id || req.user?._id || req.currentUser?._id;
  if (!userId) {
    // If not authenticated, remove temporary uploaded file
    await fs.promises.unlink(req.file.path).catch(() => {});
    return errorResponse(res, 'User authentication required.', 401);
  }

  try {
    // Parse document using universal ingestion pipeline
    const parseResult = await parseDocument(
      req.file.path,
      req.file.mimetype,
      req.file.originalname
    );

    // Create document record in database
    const document = await Document.create({
      userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: parseResult.fileType,
      pageCount: parseResult.pageCount,
      wordCount: parseResult.wordCount,
      readingTimeMinutes: parseResult.readingTimeMinutes,
      extractedText: parseResult.extractedText,
      pages: parseResult.pages,
      ocrProcessed: parseResult.ocrProcessed,
      detectedLanguage: parseResult.detectedLanguage,
    });

    // Update user's storageUsedBytes metric
    await User.findByIdAndUpdate(userId, {
      $inc: { storageUsedBytes: req.file.size },
    }).catch((err) => {
      console.warn('[DocumentController] Could not increment storageUsedBytes:', err.message);
    });

    // Record activity log & timeline history
    await logActivity({
      userId,
      userEmail: req.user?.email,
      action: 'DOC_UPLOAD',
      module: 'documind',
      details: `Uploaded ${document.originalName} (${(document.fileSize / 1024).toFixed(1)} KB)`,
    });

    await recordHistory({
      userId,
      itemType: 'document',
      itemId: document._id,
      title: document.originalName,
      summary: `${document.pageCount} pages, ${(document.fileSize / 1024).toFixed(1)} KB`,
      action: 'Document Ingestion & Abstract',
      module: 'documind',
      metadata: {
        fileType: document.fileType,
        pageCount: document.pageCount,
        detectedLanguage: document.detectedLanguage,
      },
    });

    return successResponse(
      res,
      document,
      'Document uploaded and processed successfully',
      201
    );
  } catch (error) {
    console.error('[DocumentController] Upload failed:', error);
    // Cleanup physical file on processing error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }

    return errorResponse(
      res,
      error.message || 'Failed to process and parse uploaded file.',
      500,
      error
    );
  }
};

/**
 * List user's uploaded documents with pagination & search
 * GET /api/documents
 */
export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.currentUser?._id;
    const {
      page = 1,
      limit = 10,
      search = '',
      fileType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = { userId };

    if (search && search.trim()) {
      query.originalName = { $regex: search.trim(), $options: 'i' };
    }

    if (fileType && fileType !== 'all') {
      query.fileType = fileType;
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Document.countDocuments(query),
    ]);

    return successResponse(
      res,
      {
        documents,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
      'User documents retrieved successfully'
    );
  } catch (error) {
    console.error('[DocumentController] getUserDocuments error:', error);
    return errorResponse(res, 'Failed to fetch documents', 500, error);
  }
};

/**
 * Fetch a single document by ID with authorization check
 * GET /api/documents/:id
 */
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const document = await Document.findById(id);

    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    // Ownership check
    if (document.userId.toString() !== userId && req.user?.role !== 'admin') {
      return errorResponse(res, 'Access denied. You do not own this document.', 403);
    }

    return successResponse(res, document, 'Document retrieved successfully');
  } catch (error) {
    console.error('[DocumentController] getDocumentById error:', error);
    return errorResponse(res, 'Failed to fetch document', 500, error);
  }
};

/**
 * Delete a document from database and disk
 * DELETE /api/documents/:id
 */
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const document = await Document.findById(id);

    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    if (document.userId.toString() !== userId && req.user?.role !== 'admin') {
      return errorResponse(res, 'Access denied. You do not own this document.', 403);
    }

    // Delete record from database
    await Document.findByIdAndDelete(id);

    // Decrement user storage
    await User.findByIdAndUpdate(userId, {
      $inc: { storageUsedBytes: -Math.abs(document.fileSize || 0) },
    }).catch(() => {});

    // Delete physical file on disk
    if (document.fileName) {
      const filePath = path.resolve(process.cwd(), 'uploads', document.fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath).catch((err) => {
          console.warn('[DocumentController] Could not unlink file:', err.message);
        });
      }
    }

    return successResponse(
      res,
      { id: document._id },
      'Document deleted successfully'
    );
  } catch (error) {
    console.error('[DocumentController] deleteDocument error:', error);
    return errorResponse(res, 'Failed to delete document', 500, error);
  }
};

export default {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
};
