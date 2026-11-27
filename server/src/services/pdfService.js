import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { PDFParse } from 'pdf-parse';
import * as Diff from 'diff';
import sharp from 'sharp';
import { extractTextFromImage } from './ocrService.js';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';

/**
 * Merges multiple PDF file buffers into a single unified PDF
 * @param {Array<Buffer>} fileBuffers
 * @returns {Promise<Uint8Array>}
 */
export const mergePDFs = async (fileBuffers) => {
  if (!fileBuffers || fileBuffers.length === 0) {
    throw new Error('At least one PDF file is required to merge.');
  }

  const mergedDoc = await PDFDocument.create();

  for (const buffer of fileBuffers) {
    try {
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    } catch (err) {
      console.error('[pdfService] Error merging single PDF:', err.message);
      throw new Error(`Failed to load PDF for merging: ${err.message}`);
    }
  }

  return await mergedDoc.save();
};

/**
 * Parses page range string like "1-3, 5, 7-10" into 0-based page indices
 * @param {string} rangeStr
 * @param {number} totalPages
 * @returns {number[]}
 */
export const parsePageRanges = (rangeStr, totalPages) => {
  if (!rangeStr || typeof rangeStr !== 'string') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          indices.add(i - 1);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        indices.add(pageNum - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
};

/**
 * Splits a PDF by extracting specified page ranges or page indices
 * @param {Buffer} fileBuffer
 * @param {Object} options - { ranges: "1-3, 5", pageIndices: [0, 1, 2] }
 * @returns {Promise<Uint8Array>}
 */
export const splitPDF = async (fileBuffer, options = {}) => {
  const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  let targetIndices = [];
  if (Array.isArray(options.pageIndices) && options.pageIndices.length > 0) {
    targetIndices = options.pageIndices.filter((idx) => idx >= 0 && idx < totalPages);
  } else if (options.ranges) {
    targetIndices = parsePageRanges(options.ranges, totalPages);
  } else {
    // Default: return first page if nothing specified
    targetIndices = [0];
  }

  if (targetIndices.length === 0) {
    throw new Error('No valid pages found for the specified split criteria.');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, targetIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return await newDoc.save();
};

/**
 * Rearranges pages of a PDF in the specified order
 * @param {Buffer} fileBuffer
 * @param {number[]} pageOrder - Array of 1-based or 0-based page numbers
 * @returns {Promise<Uint8Array>}
 */
export const reorderPages = async (fileBuffer, pageOrder = []) => {
  const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  if (!Array.isArray(pageOrder) || pageOrder.length === 0) {
    return await srcDoc.save();
  }

  // Normalize: if 1-based, convert to 0-based
  const normalizedIndices = pageOrder.map((p) => {
    const num = Number(p);
    return num > 0 && num <= totalPages ? num - 1 : num;
  }).filter((idx) => idx >= 0 && idx < totalPages);

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, normalizedIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return await newDoc.save();
};

/**
 * Deletes specified pages from a PDF
 * @param {Buffer} fileBuffer
 * @param {number[]} pagesToDelete - 1-based or 0-based indices
 * @returns {Promise<Uint8Array>}
 */
export const deletePages = async (fileBuffer, pagesToDelete = []) => {
  const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const toDelete = new Set(
    pagesToDelete.map((p) => {
      const num = Number(p);
      return num > 0 && num <= totalPages ? num - 1 : num;
    })
  );

  const keepIndices = [];
  for (let i = 0; i < totalPages; i++) {
    if (!toDelete.has(i)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages from PDF.');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return await newDoc.save();
};

/**
 * Rotates pages of a PDF (90, 180, 270 degrees)
 * @param {Buffer} fileBuffer
 * @param {Object} options - { globalAngle: 90, rotations: { 0: 90, 1: 180 } }
 * @returns {Promise<Uint8Array>}
 */
export const rotatePDF = async (fileBuffer, options = {}) => {
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const globalAngle = Number(options.globalAngle) || 0;
  const rotations = options.rotations || {};

  pages.forEach((page, index) => {
    let angleToAdd = globalAngle;
    if (rotations[index] !== undefined) {
      angleToAdd = Number(rotations[index]);
    } else if (rotations[index + 1] !== undefined) {
      angleToAdd = Number(rotations[index + 1]);
    }

    if (angleToAdd !== 0) {
      const currentRotation = page.getRotation().angle;
      const newAngle = (currentRotation + angleToAdd) % 360;
      page.setRotation(degrees(newAngle));
    }
  });

  return await pdfDoc.save();
};

/**
 * Adds watermark text or image across all pages
 * @param {Buffer} fileBuffer
 * @param {Object} options - { text, opacity, size, color, imageBuffer, angle }
 * @returns {Promise<Uint8Array>}
 */
export const addWatermark = async (fileBuffer, options = {}) => {
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const text = options.text || 'CONFIDENTIAL';
  const opacity = options.opacity !== undefined ? Math.max(0.05, Math.min(1, Number(options.opacity))) : 0.25;
  const fontSize = Number(options.size) || 48;
  const angle = Number(options.angle) || 45;

  // Color parse (hex or default gray/red)
  let r = 0.5, g = 0.5, b = 0.5;
  if (options.color && options.color.startsWith('#')) {
    const hex = options.color.replace('#', '');
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
    }
  }

  let embeddedImage = null;
  if (options.imageBuffer) {
    try {
      embeddedImage = await pdfDoc.embedPng(options.imageBuffer);
    } catch {
      try {
        embeddedImage = await pdfDoc.embedJpg(options.imageBuffer);
      } catch (err) {
        console.warn('[pdfService] Could not embed watermark image:', err.message);
      }
    }
  }

  for (const page of pages) {
    const { width, height } = page.getSize();

    if (embeddedImage) {
      const imgDims = embeddedImage.scale(0.5);
      page.drawImage(embeddedImage, {
        x: (width - imgDims.width) / 2,
        y: (height - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height,
        opacity,
      });
    } else {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      // Centered diagonal watermark
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(angle),
      });
    }
  }

  return await pdfDoc.save();
};

/**
 * Adds page numbers or header/footer to all pages
 * @param {Buffer} fileBuffer
 * @param {Object} options - { position: 'bottom-center'|'bottom-right'|'top-center'|etc., format: 'Page X of Y' }
 * @returns {Promise<Uint8Array>}
 */
export const addPageNumbers = async (fileBuffer, options = {}) => {
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const position = options.position || 'bottom-center';
  const format = options.format || 'Page {n} of {total}';
  const fontSize = Number(options.fontSize) || 10;
  const margin = Number(options.margin) || 30;
  const startNumber = Number(options.startNumber) || 1;
  const totalPages = pages.length;

  pages.forEach((page, index) => {
    const currentNum = startNumber + index;
    const { width, height } = page.getSize();

    const label = format
      .replace('{n}', currentNum)
      .replace('{total}', totalPages)
      .replace('Page X of Y', `Page ${currentNum} of ${totalPages}`)
      .replace('X / Y', `${currentNum} / ${totalPages}`);

    const textWidth = font.widthOfTextAtSize(label, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    let x = (width - textWidth) / 2;
    let y = margin;

    if (position.includes('left')) {
      x = margin;
    } else if (position.includes('right')) {
      x = width - margin - textWidth;
    }

    if (position.includes('top')) {
      y = height - margin - textHeight;
    }

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  return await pdfDoc.save();
};

/**
 * Crops PDF pages to specified margins or bounding box
 * @param {Buffer} fileBuffer
 * @param {Object} margins - { top: 20, right: 20, bottom: 20, left: 20 }
 * @returns {Promise<Uint8Array>}
 */
export const cropPDF = async (fileBuffer, margins = {}) => {
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  const top = Number(margins.top) || 0;
  const right = Number(margins.right) || 0;
  const bottom = Number(margins.bottom) || 0;
  const left = Number(margins.left) || 0;

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const newX = left;
    const newY = bottom;
    const newWidth = Math.max(10, width - left - right);
    const newHeight = Math.max(10, height - top - bottom);

    page.setCropBox(newX, newY, newWidth, newHeight);
  });

  return await pdfDoc.save();
};

/**
 * Embeds a signature image onto a specified page at x, y coordinates
 * @param {Buffer} fileBuffer
 * @param {Object} options - { signatureBuffer, pageNumber, x, y, width, height }
 * @returns {Promise<Uint8Array>}
 */
export const signPDF = async (fileBuffer, options = {}) => {
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const pageIndex = Math.max(0, Math.min(pages.length - 1, (Number(options.pageNumber) || 1) - 1));
  const targetPage = pages[pageIndex];

  if (!options.signatureBuffer) {
    throw new Error('Signature image buffer is required.');
  }

  let signatureImage;
  try {
    signatureImage = await pdfDoc.embedPng(options.signatureBuffer);
  } catch {
    signatureImage = await pdfDoc.embedJpg(options.signatureBuffer);
  }

  const { width: pageWidth, height: pageHeight } = targetPage.getSize();
  const sigWidth = Number(options.width) || 150;
  const sigHeight = Number(options.height) || 60;
  // default to bottom-right if coordinates not passed
  const x = options.x !== undefined ? Number(options.x) : pageWidth - sigWidth - 50;
  const y = options.y !== undefined ? Number(options.y) : 60;

  targetPage.drawImage(signatureImage, {
    x,
    y,
    width: sigWidth,
    height: sigHeight,
  });

  return await pdfDoc.save();
};

/**
 * Modifies metadata tags of a PDF
 * @param {Buffer} fileBuffer
 * @param {Object} metadata - { title, author, subject, keywords, producer }
 * @returns {Promise<Uint8Array>}
 */
export const editMetadata = async (fileBuffer, metadata = {}) => {
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });

  if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
  if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) {
    const kw = Array.isArray(metadata.keywords)
      ? metadata.keywords
      : metadata.keywords.split(',').map((k) => k.trim());
    pdfDoc.setKeywords(kw);
  }
  if (metadata.producer !== undefined) pdfDoc.setProducer(metadata.producer);
  if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);

  return await pdfDoc.save();
};

/**
 * Redacts sensitive areas by drawing solid blackout boxes over coordinates
 * @param {Buffer} fileBuffer
 * @param {Object} options - { redactions: [{ page: 1, x: 50, y: 50, width: 200, height: 20 }] }
 * @returns {Promise<Uint8Array>}
 */
export const redactPDF = async (fileBuffer, options = {}) => {
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const redactions = options.redactions || [];

  for (const item of redactions) {
    const pageIndex = (Number(item.page) || 1) - 1;
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const page = pages[pageIndex];
      page.drawRectangle({
        x: Number(item.x) || 50,
        y: Number(item.y) || 50,
        width: Number(item.width) || 150,
        height: Number(item.height) || 20,
        color: rgb(0, 0, 0),
      });
    }
  }

  return await pdfDoc.save();
};

/**
 * Compresses PDF with selectable compression profile
 * @param {Buffer} fileBuffer
 * @param {string} profile - 'low' | 'medium' | 'high'
 * @returns {Promise<Uint8Array>}
 */
export const compressPDF = async (fileBuffer, profile = 'medium') => {
  // pdf-lib's useObjectStreams provides built-in stream compression
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });

  // In high compression mode, remove unused metadata
  if (profile === 'high') {
    try {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('Docify SmartTools');
    } catch (_) {}
  }

  return await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });
};

/**
 * Protects PDF with real AES-256 password encryption
 * @param {Buffer} fileBuffer
 * @param {string} password
 * @returns {Promise<Uint8Array>}
 */
export const protectPDF = async (fileBuffer, password = '') => {
  if (!password || !password.trim()) {
    throw new Error('Please enter a password to encrypt this PDF document.');
  }
  return await encryptPDF(fileBuffer, password.trim(), { algorithm: 'AES-256' });
};

/**
 * Unlocks a password-protected PDF using the provided password
 * @param {Buffer} fileBuffer
 * @param {string} password
 * @returns {Promise<Uint8Array>}
 */
export const unlockPDF = async (fileBuffer, password = '') => {
  try {
    return await decryptPDF(fileBuffer, password ? password.trim() : '');
  } catch (err) {
    console.warn('[pdfService] unlockPDF error:', err.message);
    throw new Error(
      err.message?.includes('password')
        ? 'Incorrect password. Please verify the password and try again.'
        : 'Failed to unlock PDF. Please make sure the password is correct.'
    );
  }
};

/**
 * Combines an array of image buffers (JPG/PNG/WebP) into a multi-page PDF
 * @param {Array<{ buffer: Buffer, type?: string }>} imageFiles
 * @returns {Promise<Uint8Array>}
 */
export const imagesToPDF = async (imageFiles = []) => {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('At least one image is required to generate a PDF.');
  }

  const pdfDoc = await PDFDocument.create();

  for (const item of imageFiles) {
    const buffer = Buffer.isBuffer(item) ? item : item.buffer;
    let embeddedImg;

    try {
      embeddedImg = await pdfDoc.embedPng(buffer);
    } catch {
      try {
        embeddedImg = await pdfDoc.embedJpg(buffer);
      } catch {
        try {
          // Normalize any format (WebP, TIFF, etc.) to standard PNG buffer via Sharp
          const convertedPng = await sharp(buffer).png().toBuffer();
          embeddedImg = await pdfDoc.embedPng(convertedPng);
        } catch (err) {
          console.warn('[pdfService] Skipping non-standard image in imagesToPDF:', err.message);
          continue;
        }
      }
    }

    if (embeddedImg) {
      const { width, height } = embeddedImg;
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width,
        height,
      });
    }
  }

  return await pdfDoc.save();
};

/**
 * Helper to parse hex colors into pdf-lib rgb()
 */
const parseHexColor = (hex, defaultColor = rgb(0, 0, 0)) => {
  if (!hex || typeof hex !== 'string') return defaultColor;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return rgb(r, g, b);
  }
  if (clean.length >= 6) {
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return rgb(r, g, b);
  }
  return defaultColor;
};

/**
 * Applies visual annotations, custom text, shapes, whiteouts, freehand drawings, and stamps onto a PDF
 * @param {Buffer} pdfBuffer
 * @param {Array<Object>} edits
 * @returns {Promise<Uint8Array>}
 */
export const applyPdfEdits = async (pdfBuffer, edits = []) => {
  if (!edits || !Array.isArray(edits) || edits.length === 0) {
    return pdfBuffer;
  }

  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (const edit of edits) {
    const pageNum = Number(edit.page) || 1;
    if (pageNum < 1 || pageNum > totalPages) continue;

    const page = pages[pageNum - 1];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Scale factors if client sent canvas dimensions (viewWidth, viewHeight)
    const viewW = Number(edit.viewWidth) || pageWidth;
    const viewH = Number(edit.viewHeight) || pageHeight;
    const scaleX = pageWidth / Math.max(1, viewW);
    const scaleY = pageHeight / Math.max(1, viewH);

    const x = (Number(edit.x) || 0) * scaleX;
    const yTop = (Number(edit.y) || 0) * scaleY;
    const elWidth = (Number(edit.width) || 0) * scaleX;
    const elHeight = (Number(edit.height) || 0) * scaleY;

    // Convert top-left canvas Y coordinate to bottom-left PDF Y coordinate
    const pdfY = pageHeight - yTop - elHeight;

    switch (edit.type) {
      case 'text': {
        const textStr = String(edit.text || '');
        if (!textStr) break;

        const fontSize = Math.max(8, (Number(edit.size) || 14) * scaleY);
        let selectedFont = fontHelvetica;
        if (edit.bold) selectedFont = fontHelveticaBold;
        else if (edit.font === 'Times') selectedFont = fontTimes;
        else if (edit.font === 'Courier') selectedFont = fontCourier;

        const textColor = parseHexColor(edit.color, rgb(0, 0, 0));
        const textBaselineY = pageHeight - yTop - (fontSize * 0.85);

        page.drawText(textStr, {
          x,
          y: Math.max(0, textBaselineY),
          size: fontSize,
          font: selectedFont,
          color: textColor,
          opacity: Number(edit.opacity) || 1,
        });
        break;
      }

      case 'highlight': {
        const hColor = parseHexColor(edit.color, rgb(1, 0.9, 0));
        page.drawRectangle({
          x,
          y: Math.max(0, pdfY),
          width: elWidth || 100 * scaleX,
          height: elHeight || 20 * scaleY,
          color: hColor,
          opacity: Number(edit.opacity) || 0.35,
        });
        break;
      }

      case 'whiteout': {
        // Pure white rectangle to redact or erase existing content
        page.drawRectangle({
          x,
          y: Math.max(0, pdfY),
          width: elWidth || 100 * scaleX,
          height: elHeight || 24 * scaleY,
          color: rgb(1, 1, 1),
          opacity: 1,
        });
        break;
      }

      case 'rectangle': {
        const strokeColor = parseHexColor(edit.strokeColor || edit.color, rgb(0.02, 0.71, 0.83));
        const fillColor = edit.fillColor ? parseHexColor(edit.fillColor) : undefined;
        const borderWidth = (Number(edit.borderWidth) || 2) * scaleX;

        page.drawRectangle({
          x,
          y: Math.max(0, pdfY),
          width: elWidth || 120 * scaleX,
          height: elHeight || 60 * scaleY,
          borderColor: strokeColor,
          borderWidth,
          color: fillColor,
          opacity: Number(edit.fillOpacity) || (fillColor ? 0.2 : 0),
          borderOpacity: Number(edit.opacity) || 1,
        });
        break;
      }

      case 'drawing': {
        if (!edit.points || !Array.isArray(edit.points) || edit.points.length < 2) break;

        const drawColor = parseHexColor(edit.color, rgb(0.9, 0.2, 0.2));
        const thickness = (Number(edit.strokeWidth) || 2) * scaleX;
        const drawOpacity = Number(edit.opacity) || 1;

        for (let i = 0; i < edit.points.length - 1; i++) {
          const pt1 = edit.points[i];
          const pt2 = edit.points[i + 1];

          page.drawLine({
            start: {
              x: (Number(pt1.x) || 0) * scaleX,
              y: pageHeight - ((Number(pt1.y) || 0) * scaleY),
            },
            end: {
              x: (Number(pt2.x) || 0) * scaleX,
              y: pageHeight - ((Number(pt2.y) || 0) * scaleY),
            },
            thickness,
            color: drawColor,
            opacity: drawOpacity,
          });
        }
        break;
      }

      case 'stamp': {
        const stampText = String(edit.stampText || 'APPROVED').toUpperCase();
        const stampColor = parseHexColor(edit.color || (stampText === 'REJECTED' ? '#EF4444' : '#06B6D4'), rgb(0.02, 0.71, 0.83));
        const stampW = elWidth || 140 * scaleX;
        const stampH = elHeight || 44 * scaleY;
        const stampFontSize = Math.max(12, 16 * scaleY);

        page.drawRectangle({
          x,
          y: Math.max(0, pdfY),
          width: stampW,
          height: stampH,
          borderColor: stampColor,
          borderWidth: 2 * scaleX,
          color: stampColor,
          opacity: 0.12,
          borderOpacity: 0.9,
        });

        const textWidth = fontHelveticaBold.widthOfTextAtSize(stampText, stampFontSize);
        const textX = x + Math.max(5, (stampW - textWidth) / 2);
        const textY = Math.max(0, pdfY + (stampH - stampFontSize) / 2 + 2);

        page.drawText(stampText, {
          x: textX,
          y: textY,
          size: stampFontSize,
          font: fontHelveticaBold,
          color: stampColor,
          opacity: 0.9,
        });
        break;
      }

      case 'image': {
        if (!edit.dataUrl) break;
        try {
          const match = edit.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            const mime = match[1];
            const imgBytes = Buffer.from(match[2], 'base64');
            const embeddedImg = mime.includes('png')
              ? await pdfDoc.embedPng(imgBytes)
              : await pdfDoc.embedJpg(imgBytes);

            page.drawImage(embeddedImg, {
              x,
              y: Math.max(0, pdfY),
              width: elWidth || 100 * scaleX,
              height: elHeight || 100 * scaleY,
              opacity: Number(edit.opacity) || 1,
            });
          }
        } catch (imgErr) {
          console.warn('[pdfService] Error embedding edit image:', imgErr.message);
        }
        break;
      }

      default:
        break;
    }
  }

  return await pdfDoc.save();
};

/**
 * Extracts raw text from a PDF buffer using pdf-parse with artifact stripping and OCR fallback
 * @param {Buffer} fileBuffer
 * @returns {Promise<{ text: string, numPages: number, info: any }>}
 */
export const pdfToText = async (fileBuffer) => {
  const parser = new PDFParse({ data: fileBuffer });
  let parsed = { text: '', total: 1 };
  try {
    parsed = await parser.getText();
  } catch (err) {
    console.warn('[pdfService] getText error:', err.message);
  }

  // Strip pdf-parse artifact markers (e.g. "-- 1 of 9 --")
  let cleanText = (parsed.text || '').replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '').trim();

  // If digital text is missing or extremely short, run OCR fallback on scanned pages
  if (cleanText.length < 30) {
    try {
      const imgRes = await parser.getImage();
      if (imgRes && Array.isArray(imgRes.pages) && imgRes.pages.length > 0) {
        const ocrTexts = [];
        const maxPages = Math.min(imgRes.pages.length, 10);
        for (let i = 0; i < maxPages; i++) {
          const p = imgRes.pages[i];
          if (p.images && p.images.length > 0) {
            const mainImg = p.images.reduce((prev, curr) => ((curr.data?.length || 0) > (prev.data?.length || 0) ? curr : prev));
            if (mainImg?.dataUrl) {
              const ocrRes = await extractTextFromImage(mainImg.dataUrl, 'eng');
              if (ocrRes.text && ocrRes.text.trim()) {
                ocrTexts.push(ocrRes.text.trim());
              }
            }
          }
        }
        if (ocrTexts.length > 0) {
          cleanText = ocrTexts.join('\n\n');
        }
      }
    } catch (_) {}
  }

  return {
    text: cleanText,
    numPages: parsed.total || 1,
    info: {},
  };
};

/**
 * Converts plain text into a multi-page, formatted PDF
 * @param {string} text
 * @param {Object} options - { title, fontSize, margin, lineSpacing }
 * @returns {Promise<Uint8Array>}
 */
export const textToPDF = async (text = '', options = {}) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = Number(options.fontSize) || 11;
  const title = options.title || 'Docify Document';
  const margin = Number(options.margin) || 50;
  const lineHeight = fontSize * 1.4;

  const pageWidth = 595.28; // Standard A4 width in pt
  const pageHeight = 841.89; // Standard A4 height in pt
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Title
  if (title) {
    currentPage.drawText(title, {
      x: margin,
      y: currentY - 14,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    currentY -= 40;
  }

  // Sanitize text to ensure only characters encodable by standard fonts are drawn without crashing
  const safeText = String(text || '')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022\u25AA\u25CF]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ');

  const lines = safeText.split('\n');

  for (const rawLine of lines) {
    // Word-wrap logic
    const words = rawLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= contentWidth) {
        currentLine = testLine;
      } else {
        if (currentY - lineHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }
        currentPage.drawText(currentLine, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
        currentY -= lineHeight;
        currentLine = word;
      }
    }

    if (currentLine) {
      if (currentY - lineHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      currentPage.drawText(currentLine, {
        x: margin,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
      currentY -= lineHeight;
    }

    // Paragraph spacing for empty lines
    if (rawLine === '') {
      currentY -= lineHeight * 0.5;
    }
  }

  return await pdfDoc.save();
};

/**
 * Converts simple HTML content or stripped HTML to formatted PDF
 * @param {string} htmlContent
 * @param {Object} options
 * @returns {Promise<Uint8Array>}
 */
export const htmlToPDF = async (htmlContent = '', options = {}) => {
  // Strip tags while preserving headings and line breaks
  const cleanText = htmlContent
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n$1\n' + '='.repeat(30) + '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, ' • $1\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  return await textToPDF(cleanText, {
    title: options.title || 'HTML Export',
    fontSize: options.fontSize || 11,
  });
};

/**
 * Compares two PDF buffers and returns text-level and page diffs
 * @param {Buffer} buffer1
 * @param {Buffer} buffer2
 * @returns {Promise<Object>}
 */
export const comparePDFs = async (buffer1, buffer2) => {
  const parser1 = new PDFParse({ data: buffer1 });
  const parser2 = new PDFParse({ data: buffer2 });
  const [res1, res2] = await Promise.all([parser1.getText(), parser2.getText()]);

  const text1 = res1.text || '';
  const text2 = res2.text || '';

  const diffResult = Diff.diffWordsWithSpace(text1, text2);
  const lineDiff = Diff.diffLines(text1, text2);

  const additions = diffResult.filter((p) => p.added).length;
  const deletions = diffResult.filter((p) => p.removed).length;
  const unchanged = diffResult.filter((p) => !p.added && !p.removed).length;

  return {
    doc1: { pages: res1.total || 1, charCount: text1.length },
    doc2: { pages: res2.total || 1, charCount: text2.length },
    stats: { additions, deletions, unchanged },
    diffs: diffResult.slice(0, 150), // limit token size
    lineDiff: lineDiff.slice(0, 100),
  };
};
