import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { extractTextFromImage } from './ocrService.js';

/**
 * Heuristic language detector matching Gujarati, Hindi/Devanagari, and English/Latin scripts
 * @param {string} text
 * @returns {'en' | 'gu' | 'hi' | 'unknown'}
 */
export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return 'unknown';
  }

  const sample = text.slice(0, 10000); // Check first 10,000 characters for high speed
  const gujaratiMatches = sample.match(/[\u0A80-\u0AFF]/g) || [];
  const hindiMatches = sample.match(/[\u0900-\u097F]/g) || [];
  const englishMatches = sample.match(/[a-zA-Z]/g) || [];

  const guCount = gujaratiMatches.length;
  const hiCount = hindiMatches.length;
  const enCount = englishMatches.length;

  const total = guCount + hiCount + enCount;
  if (total === 0) return 'unknown';

  if (guCount > hiCount && guCount > enCount) return 'gu';
  if (hiCount > guCount && hiCount > enCount) return 'hi';
  if (enCount > 0) return 'en';

  return 'unknown';
};

/**
 * Calculates document reading time and counts
 * @param {string} text
 * @returns {{ wordCount: number, characterCount: number, readingTimeMinutes: number }}
 */
export const calculateTextMetadata = (text = '') => {
  const clean = (text || '').trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const characterCount = clean.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    wordCount,
    characterCount,
    readingTimeMinutes,
  };
};

/**
 * Determines normalized file type category
 * @param {string} ext
 * @param {string} mimeType
 * @returns {'pdf' | 'docx' | 'txt' | 'image' | 'other'}
 */
export const determineFileType = (ext, mimeType = '') => {
  const lowerExt = (ext || '').toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();

  if (lowerExt === '.pdf' || lowerMime === 'application/pdf') {
    return 'pdf';
  }

  if (
    ['.docx', '.doc'].includes(lowerExt) ||
    lowerMime.includes('wordprocessingml') ||
    lowerMime.includes('msword')
  ) {
    return 'docx';
  }

  if (lowerExt === '.txt' || lowerMime === 'text/plain') {
    return 'txt';
  }

  if (
    ['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.bmp'].includes(lowerExt) ||
    lowerMime.startsWith('image/')
  ) {
    return 'image';
  }

  return 'other';
};

/**
 * Main parser entry point.
 * Parses PDF, DOCX, TXT, CSV, and image files via OCR.
 *
 * @param {string} filePath
 * @param {string} mimeType
 * @param {string} originalName
 * @returns {Promise<{
 *   extractedText: string,
 *   pages: Array<{ pageNumber: number, text: string }>,
 *   pageCount: number,
 *   wordCount: number,
 *   characterCount: number,
 *   readingTimeMinutes: number,
 *   ocrProcessed: boolean,
 *   detectedLanguage: 'en' | 'gu' | 'hi' | 'unknown',
 *   fileType: 'pdf' | 'docx' | 'txt' | 'image' | 'other'
 * }>}
 */
export const parseDocument = async (filePath, mimeType = '', originalName = '') => {
  const ext = path.extname(originalName || filePath).toLowerCase();
  const fileType = determineFileType(ext, mimeType);

  let extractedText = '';
  let pages = [];
  let pageCount = 1;
  let ocrProcessed = false;

  console.log(`[DocumentParser] Parsing file "${originalName}" as type "${fileType}"...`);

  if (fileType === 'pdf') {
    const fileBuffer = await fs.promises.readFile(filePath);
    let parser;
    try {
      parser = new PDFParse({ data: fileBuffer });
      const parseResult = await parser.getText();
      pageCount = parseResult.total || 1;

      if (Array.isArray(parseResult.pages) && parseResult.pages.length > 0) {
        pages = parseResult.pages.map((p, idx) => ({
          pageNumber: p.num || idx + 1,
          text: (p.text || '').trim(),
        }));
        extractedText = pages.map((p) => p.text).join('\n\n');
      } else {
        extractedText = (parseResult.text || '').trim();
        pages = [{ pageNumber: 1, text: extractedText }];
      }

      // Scanned PDF detection:
      // If digital text is below threshold (< 50 characters for a multi-page document or empty)
      const minThreshold = pageCount > 1 ? 50 : 15;
      if (extractedText.length < minThreshold) {
        console.warn(`[DocumentParser] PDF "${originalName}" digital text is below threshold (${extractedText.length} chars). Detected as scanned PDF. Running automatic multi-page OCR...`);
        
        try {
          const imgResult = await parser.getImage();
          if (imgResult && Array.isArray(imgResult.pages) && imgResult.pages.length > 0) {
            const ocrPages = [];
            for (let i = 0; i < imgResult.pages.length; i++) {
              const p = imgResult.pages[i];
              if (p.images && p.images.length > 0) {
                // Find primary image (largest by byte length, excluding watermarks)
                const mainImg = p.images.reduce((prev, curr) => 
                  ((curr.data?.length || 0) > (prev.data?.length || 0) ? curr : prev)
                );
                if (mainImg?.dataUrl) {
                  console.log(`[DocumentParser] OCR scanning page ${i + 1}/${imgResult.pages.length}...`);
                  const ocrRes = await extractTextFromImage(mainImg.dataUrl, 'eng+guj+hin');
                  if (ocrRes.text && ocrRes.text.trim()) {
                    ocrPages.push({
                      pageNumber: i + 1,
                      text: ocrRes.text.trim(),
                    });
                  }
                }
              }
            }

            if (ocrPages.length > 0) {
              pages = ocrPages;
              extractedText = pages.map((p) => p.text).join('\n\n');
              ocrProcessed = true;
              pageCount = ocrPages.length;
              console.log(`[DocumentParser] Scanned PDF OCR succeeded! Extracted ${extractedText.length} characters across ${ocrPages.length} pages.`);
            }
          }
        } catch (ocrErr) {
          console.error(`[DocumentParser] Scanned PDF OCR extraction encountered an error:`, ocrErr.message);
        }

        // If OCR still returned empty, provide a clean informative title fallback
        if (!extractedText || extractedText.trim().length === 0) {
          extractedText = `[Scanned Document: ${originalName} with ${pageCount} visual pages]`;
          pages = [{ pageNumber: 1, text: extractedText }];
        }
      }
    } finally {
      if (parser && typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch (_) {}
      }
    }
  } else if (fileType === 'docx') {
    const docxResult = await mammoth.extractRawText({ path: filePath });
    extractedText = (docxResult.value || '').trim();

    // Map into ~500 word page segments for citation granularity in RAG
    const words = extractedText.split(/\s+/).filter(Boolean);
    const wordsPerPage = 500;
    pageCount = Math.max(1, Math.ceil(words.length / wordsPerPage));
    pages = [];

    for (let i = 0; i < pageCount; i++) {
      const pageSlice = words.slice(i * wordsPerPage, (i + 1) * wordsPerPage).join(' ');
      pages.push({
        pageNumber: i + 1,
        text: pageSlice,
      });
    }
  } else if (fileType === 'txt') {
    extractedText = await fs.promises.readFile(filePath, 'utf-8');
    extractedText = extractedText.trim();
    pageCount = 1;
    pages = [{ pageNumber: 1, text: extractedText }];
  } else if (fileType === 'image') {
    // Multilingual OCR on image file
    const ocrResult = await extractTextFromImage(filePath, 'eng+guj+hin');
    extractedText = ocrResult.text;
    pageCount = 1;
    ocrProcessed = true;
    pages = [{ pageNumber: 1, text: extractedText }];
  } else {
    // For CSV, XLSX, or other text-like files
    try {
      extractedText = await fs.promises.readFile(filePath, 'utf-8');
      extractedText = extractedText.trim();
      pageCount = 1;
      pages = [{ pageNumber: 1, text: extractedText }];
    } catch {
      extractedText = `[File uploaded: ${originalName}]`;
      pageCount = 1;
      pages = [{ pageNumber: 1, text: extractedText }];
    }
  }

  // Calculate statistics and language
  const { wordCount, characterCount, readingTimeMinutes } = calculateTextMetadata(extractedText);
  const detectedLanguage = detectLanguage(extractedText);

  console.log(
    `[DocumentParser] Parsed successfully. Words: ${wordCount}, Pages: ${pageCount}, Lang: ${detectedLanguage}, OCR: ${ocrProcessed}`
  );

  return {
    extractedText,
    pages,
    pageCount,
    wordCount,
    characterCount,
    readingTimeMinutes,
    ocrProcessed,
    detectedLanguage,
    fileType,
  };
};

export default {
  parseDocument,
  detectLanguage,
  calculateTextMetadata,
  determineFileType,
};
