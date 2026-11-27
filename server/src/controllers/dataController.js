import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Dataset } from '../models/Dataset.js';
import {
  parseFileToRows,
  profileData,
  autoCleanData,
  askDataQuery,
  detectAnomalies,
  generateDataReport,
} from '../services/dataAnalysisService.js';
import { successResponse, errorResponse } from '../utils/responseWrapper.js';

/**
 * Helper to verify dataset ownership
 */
const getAuthorizedDataset = async (datasetId, userId, userRole) => {
  const dataset = await Dataset.findById(datasetId);
  if (!dataset) {
    const error = new Error('Dataset not found');
    error.statusCode = 404;
    throw error;
  }

  if (dataset.userId.toString() !== userId.toString() && userRole !== 'admin') {
    const error = new Error('Access denied. You do not own this dataset.');
    error.statusCode = 403;
    throw error;
  }

  return dataset;
};

/**
 * Helper to read full rows from disk or sampleData
 */
const getDatasetFullRows = (dataset) => {
  if (dataset.fullDataFilePath && fs.existsSync(dataset.fullDataFilePath)) {
    try {
      const raw = fs.readFileSync(dataset.fullDataFilePath, 'utf8');
      return JSON.parse(raw);
    } catch (_) {}
  }
  return dataset.sampleData || [];
};

/**
 * Upload and Ingest Tabular Dataset (CSV, XLSX, XLS, JSON, or Google Sheets URL)
 * POST /api/data/upload
 */
export const uploadDataset = async (req, res) => {
  try {
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();
    const { sheetUrl } = req.body;

    let rows = [];
    let originalName = 'Dataset';
    let storedFileName = '';
    let fileType = 'csv';
    let fileSize = 0;
    let fullDataFilePath = '';

    // Case 1: Google Sheets Public URL or direct CSV link
    if (sheetUrl && sheetUrl.trim()) {
      let csvUrl = sheetUrl.trim();
      if (csvUrl.includes('docs.google.com/spreadsheets')) {
        // Transform to Google Sheets direct CSV export URL
        const sheetIdMatch = csvUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (sheetIdMatch) {
          csvUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv`;
        }
      }

      console.log(`[dataController] Fetching Google Sheets CSV from: ${csvUrl}`);
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch Google Sheet export (Status ${response.status}). Ensure the sheet is shared as "Anyone with the link can view".`);
      }
      const csvText = await response.text();
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: 'greedy', dynamicTyping: true });
      rows = (parsed.data || []).filter((r) => r && Object.keys(r).length > 0);

      originalName = 'Google_Sheet_Export.csv';
      fileType = 'gsheet';
      storedFileName = `${Date.now()}-gsheet.json`;
      fileSize = Buffer.byteLength(csvText, 'utf8');
    }
    // Case 2: File Upload or Pre-parsed browser rows
    else if (req.file || req.body.parsedRows) {
      if (req.body.parsedRows) {
        try {
          rows = typeof req.body.parsedRows === 'string' ? JSON.parse(req.body.parsedRows) : req.body.parsedRows;
        } catch (_) {}
      }

      if (req.file) {
        originalName = req.file.originalname;
        storedFileName = req.file.filename;
        fileSize = req.file.size;
        const ext = path.extname(originalName).toLowerCase().replace('.', '');
        fileType = ['csv', 'xlsx', 'xls', 'json'].includes(ext) ? ext : 'csv';

        if (!rows || rows.length === 0) {
          const filePath = req.file.path;
          rows = await parseFileToRows(filePath, originalName);
        }
      } else {
        originalName = req.body.originalName || 'Dataset.xlsx';
        storedFileName = `${Date.now()}-${originalName}`;
        fileType = req.body.fileType || 'xlsx';
        fileSize = Buffer.byteLength(JSON.stringify(rows), 'utf8');
      }
    } else {
      return errorResponse(res, 'Please provide a CSV/Excel file or a public Google Sheets URL.', 400);
    }

    if (!rows || rows.length === 0) {
      return errorResponse(res, 'The uploaded file contains no tabular records or rows.', 400);
    }

    // Profile the dataset
    const profiling = profileData(rows);

    // Save full data to a dedicated JSON file in uploads directory for high-speed operations
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const diskDataFilename = `data-${Date.now()}-${path.basename(originalName, path.extname(originalName))}.json`;
    fullDataFilePath = path.join(uploadsDir, diskDataFilename);
    fs.writeFileSync(fullDataFilePath, JSON.stringify(rows), 'utf8');

    // Create dataset document in MongoDB
    const dataset = await Dataset.create({
      userId,
      originalName,
      fileName: storedFileName || diskDataFilename,
      fileType,
      fileSize,
      fileUrl: `/uploads/${storedFileName || diskDataFilename}`,
      rowCount: profiling.rowCount,
      columnCount: profiling.columnCount,
      columns: profiling.columns,
      sampleData: rows.slice(0, 500), // In-memory first 500 rows
      fullDataFilePath,
      summaryStats: profiling.summaryStats,
      chartRecommendations: profiling.chartRecommendations,
    });

    return successResponse(
      res,
      dataset,
      'Dataset uploaded and profiled successfully',
      201
    );
  } catch (error) {
    console.error('[dataController] uploadDataset error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to upload and parse dataset.',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Get all datasets for current user
 * GET /api/data
 */
export const getUserDatasets = async (req, res) => {
  try {
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();
    const datasets = await Dataset.find({ userId })
      .select('-sampleData')
      .sort({ createdAt: -1 });

    return successResponse(res, datasets, 'User datasets retrieved successfully');
  } catch (error) {
    console.error('[dataController] getUserDatasets error:', error);
    return errorResponse(res, 'Failed to fetch datasets', 500, error);
  }
};

/**
 * Get dataset details, schema, and rows
 * GET /api/data/:id
 */
export const getDatasetById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 100 } = req.query;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const dataset = await getAuthorizedDataset(id, userId, req.user?.role);
    const fullRows = getDatasetFullRows(dataset);

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, Math.min(1000, parseInt(limit, 10)));
    const startIndex = (pageNum - 1) * pageSize;
    const paginatedRows = fullRows.slice(startIndex, startIndex + pageSize);

    return successResponse(
      res,
      {
        dataset,
        rows: paginatedRows,
        pagination: {
          page: pageNum,
          limit: pageSize,
          totalRows: fullRows.length,
          totalPages: Math.ceil(fullRows.length / pageSize),
        },
      },
      'Dataset retrieved successfully'
    );
  } catch (error) {
    console.error('[dataController] getDatasetById error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to retrieve dataset',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * One-Click Auto-Clean Pipeline
 * POST /api/data/:id/clean
 */
export const cleanDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();
    const options = req.body.options || {};

    const dataset = await getAuthorizedDataset(id, userId, req.user?.role);
    const fullRows = getDatasetFullRows(dataset);

    const cleanResult = autoCleanData(fullRows, dataset.columns, options);

    // Save cleaned rows to disk
    if (dataset.fullDataFilePath) {
      fs.writeFileSync(dataset.fullDataFilePath, JSON.stringify(cleanResult.cleanedRows), 'utf8');
    }

    // Update dataset document
    dataset.sampleData = cleanResult.cleanedRows.slice(0, 500);
    dataset.rowCount = cleanResult.cleanedRows.length;
    dataset.columns = cleanResult.updatedColumns;
    dataset.summaryStats = cleanResult.afterStats;

    // Append to cleaning history
    dataset.cleaningHistory.push({
      action: 'One-Click Auto-Clean',
      affectedRows: cleanResult.affectedRowsCount,
      affectedColumns: dataset.columns.map((c) => c.name),
      details: cleanResult.actionsTaken.join(' '),
      beforeStats: cleanResult.beforeStats,
      afterStats: cleanResult.afterStats,
      timestamp: new Date(),
    });

    await dataset.save();

    return successResponse(
      res,
      {
        dataset,
        actionsTaken: cleanResult.actionsTaken,
        beforeStats: cleanResult.beforeStats,
        afterStats: cleanResult.afterStats,
        sampleData: dataset.sampleData,
      },
      'Dataset auto-cleaned successfully'
    );
  } catch (error) {
    console.error('[dataController] cleanDataset error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to clean dataset',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Ask Questions in Natural Language with Formula Transparency (SRS Item 2)
 * POST /api/data/:id/ask
 */
export const askData = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, language = 'en', activeRows } = req.body;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    if (!question || !question.trim()) {
      return errorResponse(res, 'Please provide a question to ask your data.', 400);
    }

    const dataset = await getAuthorizedDataset(id, userId, req.user?.role);
    // Prioritize active cleaned dataset records from frontend state if provided, otherwise disk/sample
    const fullRows = (Array.isArray(activeRows) && activeRows.length > 0)
      ? activeRows
      : getDatasetFullRows(dataset);

    const result = await askDataQuery(fullRows, dataset.columns, question.trim(), language);

    return successResponse(
      res,
      result,
      'Data query executed with formula transparency'
    );
  } catch (error) {
    console.error('[dataController] askData error:', error);
    return errorResponse(
      res,
      error.message || 'Failed to process natural language query.',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Outlier & Anomaly Detection (SRS Item 4)
 * GET /api/data/:id/anomalies
 */
export const getAnomalies = async (req, res) => {
  try {
    const { id } = req.params;
    const { column } = req.query;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const dataset = await getAuthorizedDataset(id, userId, req.user?.role);
    const fullRows = getDatasetFullRows(dataset);

    const targetColumn = column || dataset.columns.find((c) => c.type === 'numeric')?.name;
    if (!targetColumn) {
      return errorResponse(res, 'No numeric column found in dataset for anomaly detection.', 400);
    }

    const anomalies = detectAnomalies(fullRows, targetColumn);

    return successResponse(
      res,
      anomalies,
      'Anomalies and outliers computed successfully'
    );
  } catch (error) {
    console.error('[dataController] getAnomalies error:', error);
    return errorResponse(res, 'Failed to detect anomalies', 500, error);
  }
};

/**
 * AI Insight Executive Report Generation (SRS Item 5)
 * GET /api/data/:id/report
 */
export const getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const dataset = await getAuthorizedDataset(id, userId, req.user?.role);
    const reportMarkdown = await generateDataReport(dataset, language);

    return successResponse(
      res,
      { report: reportMarkdown, language },
      'AI insight report generated successfully'
    );
  } catch (error) {
    console.error('[dataController] getReport error:', error);
    return errorResponse(res, 'Failed to generate AI data report', 500, error);
  }
};

/**
 * Export Cleaned Dataset as CSV or Excel
 * GET /api/data/:id/export
 */
export const exportCleanedData = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'csv' } = req.query;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const dataset = await getAuthorizedDataset(id, userId, req.user?.role);
    const fullRows = getDatasetFullRows(dataset);

    const cleanBaseName = path.basename(dataset.originalName, path.extname(dataset.originalName));

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(fullRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'CleanedData');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', `attachment; filename="cleaned-${cleanBaseName}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }

    // Default: CSV export
    const csvString = Papa.unparse(fullRows);
    res.setHeader('Content-Disposition', `attachment; filename="cleaned-${cleanBaseName}.csv"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.send(csvString);
  } catch (error) {
    console.error('[dataController] exportCleanedData error:', error);
    return errorResponse(res, 'Failed to export dataset', 500, error);
  }
};

/**
 * Delete Dataset
 * DELETE /api/data/:id
 */
export const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user?.id || req.user?._id || req.currentUser?._id)?.toString();

    const dataset = await getAuthorizedDataset(id, userId, req.user?.role);

    // Delete disk file if exists
    if (dataset.fullDataFilePath && fs.existsSync(dataset.fullDataFilePath)) {
      try {
        fs.unlinkSync(dataset.fullDataFilePath);
      } catch (_) {}
    }

    await Dataset.findByIdAndDelete(id);

    return successResponse(res, null, 'Dataset deleted successfully');
  } catch (error) {
    console.error('[dataController] deleteDataset error:', error);
    return errorResponse(res, 'Failed to delete dataset', 500, error);
  }
};

export default {
  uploadDataset,
  getUserDatasets,
  getDatasetById,
  cleanDataset,
  askData,
  getAnomalies,
  getReport,
  exportCleanedData,
  deleteDataset,
};
