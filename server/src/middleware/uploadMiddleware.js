import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { errorResponse } from '../utils/responseWrapper.js';

// Ensure uploads folder exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Supported MIME types and extensions
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
];

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.doc',
  '.txt',
  '.csv',
  '.xlsx',
  '.xls',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.tiff',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);
    cb(null, `${Date.now()}-${uniqueSuffix}-${sanitizedBase}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid || isExtValid) {
    cb(null, true);
  } else {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file');
    error.message = `Unsupported file format (${ext || file.mimetype}). Supported formats: .pdf, .docx, .txt, .csv, .xlsx, .png, .jpg, .jpeg`;
    cb(error, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max limit for large PDF processing
  },
});

/**
 * Express middleware wrapper for handling Multer upload with specific error messages
 */
export const handleSingleUpload = (fieldName = 'file') => {
  const uploadSingle = upload.single(fieldName);

  return (req, res, next) => {
    // Extend socket timeout for upload route
    if (req.setTimeout) {
      req.setTimeout(300000);
    }

    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return errorResponse(res, 'File size exceeds maximum allowed limit of 50 MB.', 400);
          }
          return errorResponse(res, err.message || 'File upload error occurred.', 400);
        }
        return errorResponse(res, err.message || 'Failed to process file upload.', 400);
      }
      next();
    });
  };
};

export default upload;
