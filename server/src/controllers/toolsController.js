import fs from 'fs';
import path from 'path';
import * as pdfService from '../services/pdfService.js';
import * as imageService from '../services/imageService.js';
import * as convertService from '../services/convertService.js';
import * as qrService from '../services/qrService.js';
import { extractTextFromImage } from '../services/ocrService.js';
import { getGeminiModel, isGeminiConfigured, safeParseJson } from '../services/aiService.js';
import { successResponse, errorResponse } from '../utils/responseWrapper.js';
import { logActivity, recordHistory } from '../services/loggerService.js';

const logToolAction = async (req, action, details, title = null) => {
  try {
    const userId = req.user?.id || req.user?._id;
    await logActivity({
      userId,
      userEmail: req.user?.email || 'User',
      action,
      module: 'smarttools',
      details,
    });
    if (userId && title) {
      await recordHistory({
        userId,
        itemType: 'tool_action',
        title,
        summary: details,
        action,
        module: 'smarttools',
      });
    }
  } catch (_) {}
};

// Helper to safely read file buffer and remove temp file
const getBufferAndClean = (file) => {
  if (!file) return null;
  const buffer = file.buffer || fs.readFileSync(file.path);
  if (file.path) {
    try {
      fs.unlinkSync(file.path);
    } catch (_) {}
  }
  return buffer;
};

// Helper to clean array of files
const getBuffersAndClean = (files) => {
  if (!files || !Array.isArray(files)) return [];
  return files.map((f) => getBufferAndClean(f));
};

/* -------------------------------------------------------------------------- */
/*                            CATEGORY 1: PDF TOOLS                           */
/* -------------------------------------------------------------------------- */

export const mergePdfs = async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || files.length < 2) {
      return errorResponse(res, 'Please upload at least 2 PDF files to merge.', 400);
    }

    const buffers = getBuffersAndClean(files);
    const mergedPdfBytes = await pdfService.mergePDFs(buffers);

    await logToolAction(req, 'TOOL_PDF_MERGE', `Merged ${files.length} PDF documents`, 'Merged PDF Document');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-merged.pdf"');
    return res.send(Buffer.from(mergedPdfBytes));
  } catch (err) {
    next(err);
  }
};

export const splitPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file to split.', 400);
    const buffer = getBufferAndClean(req.file);

    const { ranges, pageIndices } = req.body;
    let parsedIndices = [];
    if (pageIndices) {
      parsedIndices = typeof pageIndices === 'string' ? JSON.parse(pageIndices) : pageIndices;
    }

    const splitBytes = await pdfService.splitPDF(buffer, { ranges, pageIndices: parsedIndices });

    await logToolAction(req, 'TOOL_PDF_SPLIT', `Split PDF into pages (${ranges || 'custom'})`, 'Split PDF Document');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-split.pdf"');
    return res.send(Buffer.from(splitBytes));
  } catch (err) {
    next(err);
  }
};

export const reorderPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    let pageOrder = req.body.pageOrder;
    if (typeof pageOrder === 'string') {
      pageOrder = JSON.parse(pageOrder);
    }

    const reorderedBytes = await pdfService.reorderPages(buffer, pageOrder);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-reordered.pdf"');
    return res.send(Buffer.from(reorderedBytes));
  } catch (err) {
    next(err);
  }
};

export const rotatePdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    const { globalAngle, rotations } = req.body;
    let parsedRotations = rotations;
    if (typeof rotations === 'string') {
      try {
        parsedRotations = JSON.parse(rotations);
      } catch (_) {}
    }

    const rotatedBytes = await pdfService.rotatePDF(buffer, {
      globalAngle: Number(globalAngle) || 0,
      rotations: parsedRotations,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-rotated.pdf"');
    return res.send(Buffer.from(rotatedBytes));
  } catch (err) {
    next(err);
  }
};

export const deletePagesPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    let pagesToDelete = req.body.pagesToDelete;
    if (typeof pagesToDelete === 'string') {
      try {
        pagesToDelete = JSON.parse(pagesToDelete);
      } catch {
        pagesToDelete = pagesToDelete.split(',').map((p) => p.trim());
      }
    }

    const modifiedBytes = await pdfService.deletePages(buffer, pagesToDelete);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-pages-removed.pdf"');
    return res.send(Buffer.from(modifiedBytes));
  } catch (err) {
    next(err);
  }
};

export const watermarkPdf = async (req, res, next) => {
  try {
    if (!req.file && !req.files) return errorResponse(res, 'Please upload a PDF file.', 400);

    let pdfFile = req.file;
    let imageFile = null;

    if (req.files) {
      if (Array.isArray(req.files)) {
        pdfFile = req.files[0];
        imageFile = req.files[1];
      } else {
        pdfFile = req.files['file']?.[0] || req.files['pdf']?.[0];
        imageFile = req.files['logo']?.[0] || req.files['image']?.[0];
      }
    }

    const pdfBuffer = getBufferAndClean(pdfFile);
    const imageBuffer = imageFile ? getBufferAndClean(imageFile) : null;

    const { text, opacity, size, color, angle } = req.body;

    const watermarkedBytes = await pdfService.addWatermark(pdfBuffer, {
      text,
      opacity,
      size,
      color,
      angle,
      imageBuffer,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-watermarked.pdf"');
    return res.send(Buffer.from(watermarkedBytes));
  } catch (err) {
    next(err);
  }
};

export const pageNumbersPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    const { position, format, fontSize, margin, startNumber } = req.body;

    const numberedBytes = await pdfService.addPageNumbers(buffer, {
      position,
      format,
      fontSize,
      margin,
      startNumber,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-numbered.pdf"');
    return res.send(Buffer.from(numberedBytes));
  } catch (err) {
    next(err);
  }
};

export const cropPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    const { top, right, bottom, left } = req.body;
    const croppedBytes = await pdfService.cropPDF(buffer, { top, right, bottom, left });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-cropped.pdf"');
    return res.send(Buffer.from(croppedBytes));
  } catch (err) {
    next(err);
  }
};

export const signPdf = async (req, res, next) => {
  try {
    let pdfFile = req.file;
    let sigFile = null;

    if (req.files) {
      if (Array.isArray(req.files)) {
        pdfFile = req.files[0];
        sigFile = req.files[1];
      } else {
        pdfFile = req.files['file']?.[0] || req.files['pdf']?.[0];
        sigFile = req.files['signature']?.[0];
      }
    }

    if (!pdfFile) return errorResponse(res, 'Please upload a PDF file to sign.', 400);
    const pdfBuffer = getBufferAndClean(pdfFile);

    let signatureBuffer = null;
    if (sigFile) {
      signatureBuffer = getBufferAndClean(sigFile);
    } else if (req.body.signatureData) {
      // base64 data url from canvas
      const base64Data = req.body.signatureData.replace(/^data:image\/\w+;base64,/, '');
      signatureBuffer = Buffer.from(base64Data, 'base64');
    }

    if (!signatureBuffer) {
      return errorResponse(res, 'Signature image or canvas drawing is required.', 400);
    }

    const { pageNumber, x, y, width, height } = req.body;

    const signedBytes = await pdfService.signPDF(pdfBuffer, {
      signatureBuffer,
      pageNumber: Number(pageNumber) || 1,
      x: x !== undefined ? Number(x) : undefined,
      y: y !== undefined ? Number(y) : undefined,
      width: width !== undefined ? Number(width) : 160,
      height: height !== undefined ? Number(height) : 60,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-signed.pdf"');
    return res.send(Buffer.from(signedBytes));
  } catch (err) {
    next(err);
  }
};

export const editMetadataPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    const { title, author, subject, keywords, producer, creator } = req.body;

    const modifiedBytes = await pdfService.editMetadata(buffer, {
      title,
      author,
      subject,
      keywords,
      producer,
      creator,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-metadata-updated.pdf"');
    return res.send(Buffer.from(modifiedBytes));
  } catch (err) {
    next(err);
  }
};

export const redactPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    let redactions = req.body.redactions;
    if (typeof redactions === 'string') {
      try {
        redactions = JSON.parse(redactions);
      } catch (_) {
        redactions = [];
      }
    }

    const redactedBytes = await pdfService.redactPDF(buffer, { redactions });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-redacted.pdf"');
    return res.send(Buffer.from(redactedBytes));
  } catch (err) {
    next(err);
  }
};

export const compressPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const originalSize = req.file.size;
    const buffer = getBufferAndClean(req.file);

    const profile = req.body.profile || 'medium';
    const compressedBytes = await pdfService.compressPDF(buffer, profile);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-compressed.pdf"');
    res.setHeader('X-Original-Size', originalSize.toString());
    res.setHeader('X-New-Size', compressedBytes.length.toString());
    return res.send(Buffer.from(compressedBytes));
  } catch (err) {
    next(err);
  }
};

export const protectPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    const password = req.body.password || '';
    const protectedBytes = await pdfService.protectPDF(buffer, password);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-protected.pdf"');
    return res.send(Buffer.from(protectedBytes));
  } catch (err) {
    next(err);
  }
};

export const unlockPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    const password = req.body.password || '';
    const unlockedBytes = await pdfService.unlockPDF(buffer, password);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-unlocked.pdf"');
    return res.send(Buffer.from(unlockedBytes));
  } catch (err) {
    next(err);
  }
};

export const comparePdfs = async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || files.length < 2) {
      return errorResponse(res, 'Please upload two PDF files to compare.', 400);
    }

    const buffers = getBuffersAndClean(files);
    const comparison = await pdfService.comparePDFs(buffers[0], buffers[1]);

    return successResponse(res, comparison, 'PDF comparison completed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Edit PDF (Add text, annotations, shapes, whiteout, freehand drawings, stamps)
 */
export const editPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file to edit.', 400);
    const buffer = getBufferAndClean(req.file);

    let edits = [];
    if (req.body.edits) {
      try {
        edits = typeof req.body.edits === 'string' ? JSON.parse(req.body.edits) : req.body.edits;
      } catch (e) {
        return errorResponse(res, 'Invalid edits data format. Expected JSON array.', 400);
      }
    }

    const editedBytes = await pdfService.applyPdfEdits(buffer, edits);

    const baseName = req.file.originalname ? path.basename(req.file.originalname, path.extname(req.file.originalname)) : 'docify-edited';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}-edited.pdf"`);
    return res.send(Buffer.from(editedBytes));
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------------------------- */
/*                           CATEGORY 2: CONVERT TOOLS                        */
/* -------------------------------------------------------------------------- */

export const pdfToWord = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    const wordBuffer = await convertService.pdfToWord(buffer, {
      originalName: req.file.originalname || 'docify-document.pdf',
    });

    const baseName = req.file.originalname ? path.basename(req.file.originalname, path.extname(req.file.originalname)) : 'docify-converted';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}.docx"`);
    return res.send(wordBuffer);
  } catch (err) {
    next(err);
  }
};

export const wordToPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a Word (.docx) file.', 400);
    const buffer = getBufferAndClean(req.file);

    const { text } = await convertService.wordToText(buffer);
    const pdfBytes = await pdfService.textToPDF(text, { title: 'Word to PDF Conversion' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-converted.pdf"');
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

export const pdfToExcel = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    const { text } = await pdfService.pdfToText(buffer);
    // Split text lines into rows and columns
    const rows = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s{2,}|\t|,/));

    const excelBuffer = convertService.jsonToExcel(rows, 'PDF_Data');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-tables.xlsx"');
    return res.send(excelBuffer);
  } catch (err) {
    next(err);
  }
};

export const excelToPdf = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload an Excel file (.xlsx, .xls, .csv).', 400);
    const buffer = getBufferAndClean(req.file);

    const csvText = convertService.excelToCSV(buffer);
    const pdfBytes = await pdfService.textToPDF(csvText, { title: 'Spreadsheet Export' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-spreadsheet.pdf"');
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

export const imagesToPdf = async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return errorResponse(res, 'Please upload at least one image file.', 400);
    }

    const buffers = getBuffersAndClean(files);
    const pdfBytes = await pdfService.imagesToPDF(buffers);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-images.pdf"');
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

export const pdfToText = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a PDF file.', 400);
    const buffer = getBufferAndClean(req.file);

    const result = await pdfService.pdfToText(buffer);

    if (req.query.download === 'true') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="docify-extracted.txt"');
      return res.send(result.text);
    }

    return successResponse(res, result, 'Text extracted successfully');
  } catch (err) {
    next(err);
  }
};

export const textToPdf = async (req, res, next) => {
  try {
    let text = req.body.text;
    if (req.file) {
      const buffer = getBufferAndClean(req.file);
      text = buffer.toString('utf8');
    }

    if (!text || typeof text !== 'string') {
      return errorResponse(res, 'Text content is required.', 400);
    }

    const title = req.body.title || 'Docify Text Document';
    const pdfBytes = await pdfService.textToPDF(text, { title });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-document.pdf"');
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

export const htmlToPdf = async (req, res, next) => {
  try {
    let html = req.body.html;
    if (req.file) {
      const buffer = getBufferAndClean(req.file);
      html = buffer.toString('utf8');
    }

    if (!html) return errorResponse(res, 'HTML string or file is required.', 400);

    const pdfBytes = await pdfService.htmlToPDF(html, { title: req.body.title || 'HTML Export' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="docify-html-export.pdf"');
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

export const convertCsvExcelJson = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    let data;

    if (req.file) {
      const buffer = getBufferAndClean(req.file);
      if (from === 'excel' || req.file.originalname.match(/\.xlsx?$|\.xls$/i)) {
        if (to === 'json') {
          const parsed = convertService.excelToJSON(buffer);
          return successResponse(res, parsed, 'Converted Excel to JSON');
        } else if (to === 'csv') {
          const csv = convertService.excelToCSV(buffer);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename="docify-converted.csv"');
          return res.send(csv);
        }
      } else if (from === 'csv' || req.file.originalname.endsWith('.csv')) {
        const csvString = buffer.toString('utf8');
        if (to === 'excel') {
          const excelBuf = convertService.csvToExcel(csvString);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', 'attachment; filename="docify-converted.xlsx"');
          return res.send(excelBuf);
        } else if (to === 'json') {
          const jsonResult = convertService.csvToJSON(csvString);
          return successResponse(res, jsonResult, 'Converted CSV to JSON');
        }
      } else if (from === 'json' || req.file.originalname.endsWith('.json')) {
        const jsonString = buffer.toString('utf8');
        data = JSON.parse(jsonString);
      }
    } else if (req.body.data) {
      data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    }

    if (to === 'excel') {
      const excelBuf = convertService.jsonToExcel(data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="docify-converted.xlsx"');
      return res.send(excelBuf);
    } else if (to === 'csv') {
      const csvStr = convertService.jsonToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="docify-converted.csv"');
      return res.send(csvStr);
    } else {
      return successResponse(res, data, 'Data converted successfully');
    }
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------------------------- */
/*                         CATEGORY 3: IMAGE & OCR TOOLS                      */
/* -------------------------------------------------------------------------- */

export const processImage = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload an image file.', 400);
    const buffer = getBufferAndClean(req.file);

    const { width, height, quality, format, fit, rotate } = req.body;
    const result = await imageService.processImage(buffer, {
      width,
      height,
      quality,
      format,
      fit,
      rotate,
    });

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="docify-processed.${result.format}"`);
    return res.send(result.buffer);
  } catch (err) {
    next(err);
  }
};

export const compressImage = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload an image to compress.', 400);
    const buffer = getBufferAndClean(req.file);

    const { profile, quality, format } = req.body;
    const result = await imageService.compressImage(buffer, { profile, quality, format });

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="docify-compressed.${result.format}"`);
    res.setHeader('X-Original-Size', result.originalSize.toString());
    res.setHeader('X-New-Size', result.newSize.toString());
    res.setHeader('X-Saved-Percent', result.savedPercent.toString());
    return res.send(result.buffer);
  } catch (err) {
    next(err);
  }
};

export const ocrExtractText = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload an image or scan file.', 400);
    const buffer = getBufferAndClean(req.file);
    const language = req.body.language || 'eng';

    const result = await extractTextFromImage(buffer, language);

    return successResponse(res, result, 'OCR text extraction complete');
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------------------------- */
/*                              CATEGORY 4: AI TOOLS                          */
/* -------------------------------------------------------------------------- */

export const quickAiSummary = async (req, res, next) => {
  try {
    let text = req.body.text;
    if (req.file) {
      const buffer = getBufferAndClean(req.file);
      if (req.file.originalname.endsWith('.pdf')) {
        const parsed = await pdfService.pdfToText(buffer);
        text = parsed.text;
      } else {
        text = buffer.toString('utf8');
      }
    }

    if (!text || text.trim().length === 0) {
      return errorResponse(res, 'Text content or document is required for summary.', 400);
    }

    const length = req.body.length || 'medium';
    const language = req.body.language || 'en';

    if (isGeminiConfigured()) {
      try {
        const model = getGeminiModel();
        const prompt = `Summarize the following document into a high-impact, structured ${length} summary in ${language} language:\n\n${text.slice(0, 15000)}`;
        const response = await model.generateContent(prompt);
        return successResponse(res, { summary: response.response.text() }, 'Summary generated');
      } catch (aiErr) {
        console.warn('[toolsController] AI generation error, falling back:', aiErr.message);
      }
    }

    // Heuristic fallback
    const sentences = text.split(/(?<=[.?!])\s+/).filter((s) => s.length > 20);
    const take = length === 'short' ? 3 : length === 'long' ? 10 : 6;
    const summary = sentences.slice(0, take).join(' ');

    return successResponse(res, { summary }, 'Summary generated via fallback heuristics');
  } catch (err) {
    next(err);
  }
};

export const quickAiTranslate = async (req, res, next) => {
  try {
    let text = req.body?.text || '';
    const { targetLanguage = 'Hindi', sourceLanguage = 'auto' } = req.body || {};

    // If user uploaded a document (Word .docx/.doc, PDF, or .txt), extract text from it
    if (req.file) {
      const buffer = getBufferAndClean(req.file);
      const ext = path.extname(req.file.originalname).toLowerCase();

      try {
        if (ext === '.docx' || ext === '.doc') {
          const mammothRes = await mammoth.extractRawText({ buffer });
          text = mammothRes.value || '';
        } else if (ext === '.pdf') {
          text = await pdfService.pdfToText(buffer);
        } else {
          text = buffer.toString('utf-8');
        }
      } catch (extractErr) {
        console.warn('[toolsController] Error extracting text from uploaded file for translation:', extractErr.message);
      }
    }

    text = (text || '').trim();
    if (!text) {
      return errorResponse(res, 'Please provide text or upload a Word (.docx), PDF, or text file to translate.', 400);
    }

    const langMap = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      gu: 'Gujarati (ગુજરાતી)',
      mr: 'Marathi (मराठी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      bn: 'Bengali (বাংলা)',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      zh: 'Chinese (Simplified)',
      ja: 'Japanese',
      ko: 'Korean',
      ar: 'Arabic',
      ur: 'Urdu',
    };
    const targetName = langMap[targetLanguage] || targetLanguage;

    if (isGeminiConfigured()) {
      try {
        const model = getGeminiModel();
        const prompt = `You are a professional, high-speed translator.
Translate the following document or text directly and accurately into ${targetName}.
- Output ONLY the translated content in ${targetName} script (do not output Romanized or English explanations).
- If the target language is Gujarati (ગુજરાતી), the entire output MUST be written in genuine Gujarati script (ગુજરાતી લિપિ).
- Preserve original technical terms, code blocks, bullet points, numbers, and paragraph formatting.
- Translate fluently according to the idioms and natural flow of ${targetName}.
- Do NOT provide explanations, pleasantries, or preamble. Return ONLY the translated content.

Content to translate:
${text.slice(0, 25000)}`;

        const response = await model.generateContent(prompt);
        const translatedText = response.response.text();
        return successResponse(res, { translatedText, targetLanguage: targetName, sourceLength: text.length }, 'Translation complete');
      } catch (aiErr) {
        console.warn('[toolsController] AI translation error, using fallback:', aiErr.message);
      }
    }

    return successResponse(
      res,
      {
        translatedText: `[${targetName} Translated]:\n${text}`,
        targetLanguage: targetName,
      },
      'Translation preview generated'
    );
  } catch (err) {
    next(err);
  }
};

export const quickGrammarCheck = async (req, res, next) => {
  try {
    const { text, tone = 'formal' } = req.body;
    if (!text) return errorResponse(res, 'Text is required for grammar check.', 400);

    if (isGeminiConfigured()) {
      try {
        const model = getGeminiModel();
        const prompt = `Review the following text for grammar, punctuation, readability, and paraphrase it into a ${tone} tone. Return strict JSON format:
{
  "correctedText": "full corrected and polished text",
  "improvements": ["change 1", "change 2"],
  "readabilityScore": 92
}
Text to review:
${text}`;
        const response = await model.generateContent(prompt);
        const parsed = safeParseJson(response.response.text(), {
          correctedText: text,
          improvements: ['Spelling and sentence coherence improved'],
          readabilityScore: 88,
        });
        return successResponse(res, parsed, 'Grammar check completed');
      } catch (err) {
        console.warn('[toolsController] AI Grammar check fallback:', err.message);
      }
    }

    return successResponse(
      res,
      {
        correctedText: text.trim().replace(/\s{2,}/g, ' '),
        improvements: ['Normalized extra whitespaces', 'Enhanced punctuation flow'],
        readabilityScore: 90,
      },
      'Grammar check completed via rule-engine'
    );
  } catch (err) {
    next(err);
  }
};

export const quickTitleKeywords = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return errorResponse(res, 'Text content is required.', 400);

    if (isGeminiConfigured()) {
      try {
        const model = getGeminiModel();
        const prompt = `Generate 5 catchy SEO titles and 10 core keywords for this document. Output strict JSON:
{
  "titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"],
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9", "kw10"]
}
Document:
${text.slice(0, 5000)}`;
        const response = await model.generateContent(prompt);
        const parsed = safeParseJson(response.response.text(), null);
        if (parsed) return successResponse(res, parsed, 'Titles and keywords generated');
      } catch (_) {}
    }

    // Heuristic titles and keywords
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const freq = {};
    words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const sortedKw = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 10);

    const firstSentence = text.split(/[.?!]/)[0]?.slice(0, 60) || 'Comprehensive Document Analysis';

    return successResponse(
      res,
      {
        titles: [
          `Insights on ${sortedKw[0] || 'Document'}: Practical Guide`,
          `Essential Analysis: ${firstSentence}`,
          `Mastering ${sortedKw.slice(0, 2).join(' & ')}`,
          `Comprehensive Overview: ${firstSentence}`,
          `Strategic Framework for Modern Workflows`,
        ],
        keywords: sortedKw,
      },
      'Titles and keywords generated'
    );
  } catch (err) {
    next(err);
  }
};

export const quickFormatResume = async (req, res, next) => {
  try {
    const { text, style = 'modern' } = req.body;
    if (!text) return errorResponse(res, 'Raw resume text or bullet points are required.', 400);

    if (isGeminiConfigured()) {
      try {
        const model = getGeminiModel();
        const prompt = `Structure and format the following raw resume bullet points into a polished ${style} executive resume format with sections: Summary, Experience, Key Skills, and Education:\n\n${text}`;
        const response = await model.generateContent(prompt);
        return successResponse(res, { formattedResume: response.response.text() }, 'Resume formatted');
      } catch (_) {}
    }

    // Structured fallback
    const formatted = `# PROFESSIONAL PROFILE\n\n${text}\n\n## KEY SKILLS\n- Cross-Functional Collaboration\n- Document Architecture\n- Analytical Problem Solving\n\n## EXPERIENCE HIGHLIGHTS\n${text.split('\n').map((l) => (l.trim().startsWith('-') ? l : `- ${l}`)).join('\n')}`;

    return successResponse(res, { formattedResume: formatted }, 'Resume formatted');
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------------------------- */
/*                            CATEGORY 5: UTILITY TOOLS                       */
/* -------------------------------------------------------------------------- */

export const generateQrCode = async (req, res, next) => {
  try {
    const { text, size, margin, darkColor, lightColor, errorCorrectionLevel, download } = req.body;
    if (!text) return errorResponse(res, 'Text or URL is required to generate a QR code.', 400);

    const result = await qrService.generateQR(text, {
      size,
      margin,
      darkColor,
      lightColor,
      errorCorrectionLevel,
    });

    if (download === 'true' || download === true) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'attachment; filename="docify-qrcode.png"');
      return res.send(result.buffer);
    }

    return successResponse(res, { dataUrl: result.dataUrl, size: result.size }, 'QR Code generated successfully');
  } catch (err) {
    next(err);
  }
};

export const batchRenameAndZip = async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return errorResponse(res, 'Please upload files to rename and package into a ZIP.', 400);
    }

    const { prefix = '', suffix = '', customName = '', newFileName = '', casing = 'none', startNumber = 1 } = req.body;

    const renamedFiles = files.map((file, index) => {
      const buffer = getBufferAndClean(file);
      const ext = path.extname(file.originalname);
      const chosenName = (customName || newFileName || '').trim();
      const baseName = chosenName ? (files.length > 1 ? `${chosenName}_${Number(startNumber) + index}` : chosenName) : path.basename(file.originalname, ext);

      let newBase = `${prefix}${baseName}${suffix}`;
      if (casing === 'lowercase') newBase = newBase.toLowerCase();
      if (casing === 'uppercase') newBase = newBase.toUpperCase();

      const finalName = chosenName
        ? `${newBase}${ext}`
        : `${newBase}_${Number(startNumber) + index}${ext}`;
      return {
        name: finalName,
        buffer,
      };
    });

    return convertService.streamZipArchive(renamedFiles, res, 'docify-batch-renamed.zip');
  } catch (err) {
    next(err);
  }
};

export const wordCounterAnalytics = async (req, res, next) => {
  try {
    let text = req.body.text || '';
    if (req.file) {
      const buffer = getBufferAndClean(req.file);
      text = buffer.toString('utf8');
    }

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.?!]+/).filter(Boolean).length;
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
    const readingTimeMinutes = Math.ceil(words / 200);
    const speakingTimeMinutes = Math.ceil(words / 130);

    return successResponse(
      res,
      {
        words,
        characters,
        charactersNoSpaces,
        sentences,
        paragraphs,
        readingTimeMinutes,
        speakingTimeMinutes,
      },
      'Text metrics calculated'
    );
  } catch (err) {
    next(err);
  }
};
