import api from './api';

/**
 * Utility to prompt browser to download a Blob file
 */
export const downloadBlob = (blob, defaultFilename = 'downloaded-file') => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/* -------------------------------------------------------------------------- */
/*                                CATEGORY 1: PDF                             */
/* -------------------------------------------------------------------------- */

export const mergePdfs = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await api.post('/tools/merge', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const splitPdf = async (file, { ranges, pageIndices }) => {
  const formData = new FormData();
  formData.append('file', file);
  if (ranges) formData.append('ranges', ranges);
  if (pageIndices) formData.append('pageIndices', JSON.stringify(pageIndices));

  const response = await api.post('/tools/split', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const reorderPdf = async (file, pageOrder) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pageOrder', JSON.stringify(pageOrder));

  const response = await api.post('/tools/reorder', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const rotatePdf = async (file, { globalAngle, rotations }) => {
  const formData = new FormData();
  formData.append('file', file);
  if (globalAngle !== undefined) formData.append('globalAngle', globalAngle);
  if (rotations) formData.append('rotations', JSON.stringify(rotations));

  const response = await api.post('/tools/rotate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const deletePagesPdf = async (file, pagesToDelete) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pagesToDelete', JSON.stringify(pagesToDelete));

  const response = await api.post('/tools/delete-pages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const watermarkPdf = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.text) formData.append('text', options.text);
  if (options.opacity !== undefined) formData.append('opacity', options.opacity);
  if (options.size !== undefined) formData.append('size', options.size);
  if (options.color) formData.append('color', options.color);
  if (options.angle !== undefined) formData.append('angle', options.angle);
  if (options.logoFile) formData.append('logo', options.logoFile);

  const response = await api.post('/tools/watermark', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const addPageNumbers = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.position) formData.append('position', options.position);
  if (options.format) formData.append('format', options.format);
  if (options.fontSize) formData.append('fontSize', options.fontSize);
  if (options.margin) formData.append('margin', options.margin);
  if (options.startNumber) formData.append('startNumber', options.startNumber);

  const response = await api.post('/tools/page-numbers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const cropPdf = async (file, margins = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (margins.top) formData.append('top', margins.top);
  if (margins.right) formData.append('right', margins.right);
  if (margins.bottom) formData.append('bottom', margins.bottom);
  if (margins.left) formData.append('left', margins.left);

  const response = await api.post('/tools/crop', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const signPdf = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.signatureData) formData.append('signatureData', options.signatureData);
  if (options.signatureFile) formData.append('signature', options.signatureFile);
  if (options.pageNumber) formData.append('pageNumber', options.pageNumber);
  if (options.x !== undefined) formData.append('x', options.x);
  if (options.y !== undefined) formData.append('y', options.y);
  if (options.width) formData.append('width', options.width);
  if (options.height) formData.append('height', options.height);

  const response = await api.post('/tools/sign', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const editMetadata = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  Object.keys(metadata).forEach((k) => {
    if (metadata[k]) formData.append(k, metadata[k]);
  });

  const response = await api.post('/tools/edit-metadata', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const redactPdf = async (file, redactions = []) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('redactions', JSON.stringify(redactions));

  const response = await api.post('/tools/redact', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const compressPdf = async (file, profile = 'medium') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('profile', profile);

  const response = await api.post('/tools/compress', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const protectPdf = async (file, password) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);

  const response = await api.post('/tools/protect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const unlockPdf = async (file, password) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);

  const response = await api.post('/tools/unlock', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

export const comparePdfs = async (file1, file2) => {
  const formData = new FormData();
  formData.append('files', file1);
  formData.append('files', file2);

  return await api.post('/tools/compare', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const editPdf = async (file, edits = []) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('edits', typeof edits === 'string' ? edits : JSON.stringify(edits));

  const response = await api.post('/tools/edit-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
  return response;
};

/* -------------------------------------------------------------------------- */
/*                               CATEGORY 2: CONVERT                          */
/* -------------------------------------------------------------------------- */

export const pdfToWord = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return await api.post('/tools/pdf-to-word', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
};

export const wordToPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return await api.post('/tools/word-to-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
};

export const pdfToExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return await api.post('/tools/pdf-to-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
};

export const excelToPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return await api.post('/tools/excel-to-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
};

export const imagesToPdf = async (files) => {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  return await api.post('/tools/images-to-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
};

export const pdfToText = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return await api.post('/tools/pdf-to-text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const textToPdf = async ({ text, title, file }) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (text) formData.append('text', text);
  if (title) formData.append('title', title);

  return await api.post('/tools/text-to-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
};

export const htmlToPdf = async ({ html, title }) => {
  return await api.post(
    '/tools/html-to-pdf',
    { html, title },
    { responseType: 'blob' }
  );
};

export const convertData = async ({ file, data, from, to }) => {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('from', from);
    formData.append('to', to);

    const isBinaryDownload = to === 'excel' || to === 'csv';
    return await api.post('/tools/convert-data', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: isBinaryDownload ? 'blob' : 'json',
    });
  }

  const isBinaryDownload = to === 'excel' || to === 'csv';
  return await api.post(
    '/tools/convert-data',
    { data, from, to },
    { responseType: isBinaryDownload ? 'blob' : 'json' }
  );
};

/* -------------------------------------------------------------------------- */
/*                            CATEGORY 3: IMAGE & OCR                         */
/* -------------------------------------------------------------------------- */

export const processImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.width) formData.append('width', options.width);
  if (options.height) formData.append('height', options.height);
  if (options.quality) formData.append('quality', options.quality);
  if (options.format) formData.append('format', options.format);
  if (options.fit) formData.append('fit', options.fit);
  if (options.rotate) formData.append('rotate', options.rotate);

  return await api.post('/tools/image/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
};

export const compressImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.profile) formData.append('profile', options.profile);
  if (options.quality) formData.append('quality', options.quality);
  if (options.format) formData.append('format', options.format);

  return await api.post('/tools/image/compress', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
};

export const ocrExtract = async (file, language = 'eng') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  return await api.post('/tools/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/* -------------------------------------------------------------------------- */
/*                                CATEGORY 4: AI                              */
/* -------------------------------------------------------------------------- */

export const quickAiSummary = async ({ text, file, length = 'medium', language = 'en' }) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (text) formData.append('text', text);
  formData.append('length', length);
  formData.append('language', language);

  return await api.post('/tools/ai/summary', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const quickAiTranslate = async ({ text, file, targetLanguage = 'hi', sourceLanguage = 'auto' }) => {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    if (text) formData.append('text', text);
    formData.append('targetLanguage', targetLanguage);
    formData.append('sourceLanguage', sourceLanguage);
    return await api.post('/tools/ai/translate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return await api.post('/tools/ai/translate', { text, targetLanguage, sourceLanguage });
};

export const quickGrammar = async ({ text, tone = 'formal' }) => {
  return await api.post('/tools/ai/grammar', { text, tone });
};

export const quickTitleKeywords = async ({ text }) => {
  return await api.post('/tools/ai/title-keywords', { text });
};

export const quickFormatResume = async ({ text, style = 'modern' }) => {
  return await api.post('/tools/ai/format-resume', { text, style });
};

/* -------------------------------------------------------------------------- */
/*                            CATEGORY 5: UTILITIES                           */
/* -------------------------------------------------------------------------- */

export const generateQrCode = async (options = {}) => {
  return await api.post('/tools/qr/generate', options);
};

export const downloadQrCode = async (options = {}) => {
  return await api.post('/tools/qr/generate', { ...options, download: true }, { responseType: 'blob' });
};

export const batchRenameAndZip = async (files, options = {}) => {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  if (options.customName || options.newFileName) {
    formData.append('customName', options.customName || options.newFileName);
  }
  if (options.prefix) formData.append('prefix', options.prefix);
  if (options.suffix) formData.append('suffix', options.suffix);
  if (options.casing) formData.append('casing', options.casing);
  if (options.startNumber) formData.append('startNumber', options.startNumber);

  return await api.post('/tools/batch-rename-zip', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });
};

export const wordCounter = async ({ text, file }) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (text) formData.append('text', text);

  return await api.post('/tools/word-counter', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
