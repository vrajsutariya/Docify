import { Router } from 'express';
import { upload, handleSingleUpload, handleMultipleUpload } from '../middleware/uploadMiddleware.js';
import * as toolsController from '../controllers/toolsController.js';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                            CATEGORY 1: PDF TOOLS                           */
/* -------------------------------------------------------------------------- */

// 1. Merge PDF
router.post('/merge', handleMultipleUpload('files', 20), toolsController.mergePdfs);

// 2. Split PDF
router.post('/split', handleSingleUpload('file'), toolsController.splitPdf);

// 3. Reorder Pages
router.post('/reorder', handleSingleUpload('file'), toolsController.reorderPdf);

// 4. Rotate PDF Pages
router.post('/rotate', handleSingleUpload('file'), toolsController.rotatePdf);

// 5. Delete Pages
router.post('/delete-pages', handleSingleUpload('file'), toolsController.deletePagesPdf);

// 6. Watermark PDF
router.post('/watermark', upload.any(), toolsController.watermarkPdf);

// 7. Page Numbers, Header & Footer
router.post('/page-numbers', handleSingleUpload('file'), toolsController.pageNumbersPdf);

// 8. Crop PDF Pages
router.post('/crop', handleSingleUpload('file'), toolsController.cropPdf);

// 9. Sign PDF
router.post('/sign', upload.any(), toolsController.signPdf);

// 10. Edit PDF Metadata
router.post('/edit-metadata', handleSingleUpload('file'), toolsController.editMetadataPdf);

// 11. Redact PDF
router.post('/redact', handleSingleUpload('file'), toolsController.redactPdf);

// 12. Compress PDF
router.post('/compress', handleSingleUpload('file'), toolsController.compressPdf);

// 13. Protect & Unlock PDF
router.post('/protect', handleSingleUpload('file'), toolsController.protectPdf);
router.post('/unlock', handleSingleUpload('file'), toolsController.unlockPdf);

// Compare Two PDFs
router.post('/compare', handleMultipleUpload('files', 2), toolsController.comparePdfs);

// Edit PDF (Add text, annotations, shapes, whiteout, freehand drawings, stamps)
router.post('/edit-pdf', handleSingleUpload('file'), toolsController.editPdf);

/* -------------------------------------------------------------------------- */
/*                           CATEGORY 2: CONVERT TOOLS                        */
/* -------------------------------------------------------------------------- */

// 14. PDF ↔ Word
router.post('/pdf-to-word', handleSingleUpload('file'), toolsController.pdfToWord);
router.post('/word-to-pdf', handleSingleUpload('file'), toolsController.wordToPdf);

// 15. PDF ↔ Excel
router.post('/pdf-to-excel', handleSingleUpload('file'), toolsController.pdfToExcel);
router.post('/excel-to-pdf', handleSingleUpload('file'), toolsController.excelToPdf);

// 16. PDF ↔ Images
router.post('/images-to-pdf', handleMultipleUpload('files', 50), toolsController.imagesToPdf);

// 17. PDF ↔ Text
router.post('/pdf-to-text', handleSingleUpload('file'), toolsController.pdfToText);
router.post('/text-to-pdf', handleSingleUpload('file'), toolsController.textToPdf);

// 18. HTML to PDF
router.post('/html-to-pdf', handleSingleUpload('file'), toolsController.htmlToPdf);

// 19. CSV / Excel / JSON Conversion
router.post('/convert-data', handleSingleUpload('file'), toolsController.convertCsvExcelJson);

/* -------------------------------------------------------------------------- */
/*                         CATEGORY 3: IMAGE & OCR TOOLS                      */
/* -------------------------------------------------------------------------- */

// 20. Process & Resize Image
router.post('/image/process', handleSingleUpload('file'), toolsController.processImage);

// 21. Compress Image
router.post('/image/compress', handleSingleUpload('file'), toolsController.compressImage);

// 22. Multilingual OCR (English, Gujarati, Hindi)
router.post('/ocr', handleSingleUpload('file'), toolsController.ocrExtractText);

/* -------------------------------------------------------------------------- */
/*                              CATEGORY 4: AI TOOLS                          */
/* -------------------------------------------------------------------------- */

// 23. AI Summarizer
router.post('/ai/summary', handleSingleUpload('file'), toolsController.quickAiSummary);

// 24. AI Translator (supports direct text or uploaded Word/PDF/TXT files)
router.post('/ai/translate', handleSingleUpload('file'), toolsController.quickAiTranslate);

// 25. AI Grammar & Paraphrase Checker
router.post('/ai/grammar', toolsController.quickGrammarCheck);

// 26. AI Title & Keyword Generator
router.post('/ai/title-keywords', toolsController.quickTitleKeywords);

// 27. Resume & Notes Formatter
router.post('/ai/format-resume', toolsController.quickFormatResume);

/* -------------------------------------------------------------------------- */
/*                            CATEGORY 5: UTILITY TOOLS                       */
/* -------------------------------------------------------------------------- */

// 28. QR Code Generator & Scanner
router.post('/qr/generate', toolsController.generateQrCode);

// 29. File Renamer & Bulk ZIP Download
router.post('/batch-rename-zip', handleMultipleUpload('files', 50), toolsController.batchRenameAndZip);

// 30. Word & Character Counter Analytics
router.post('/word-counter', handleSingleUpload('file'), toolsController.wordCounterAnalytics);

export default router;
