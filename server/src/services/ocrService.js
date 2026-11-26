import Tesseract from 'tesseract.js';

// Worker pool / cache to eliminate massive overhead of re-creating Tesseract workers
let cachedWorker = null;
let cachedLanguages = '';
let isInitializing = false;
let initPromise = null;

/**
 * Gets or initializes a shared Tesseract worker.
 * Reusing a single worker instance makes subsequent OCR calls 5-10x faster.
 *
 * @param {string} languages
 * @returns {Promise<any>}
 */
const getWorker = async (languages = 'eng') => {
  if (cachedWorker && cachedLanguages === languages) {
    return cachedWorker;
  }

  if (isInitializing && initPromise) {
    await initPromise;
    if (cachedWorker && cachedLanguages === languages) {
      return cachedWorker;
    }
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      if (cachedWorker) {
        try {
          await cachedWorker.terminate();
        } catch (_) {}
        cachedWorker = null;
      }

      console.log(`[OCR Service] Initializing cached Tesseract worker for: ${languages}`);
      const worker = await Tesseract.createWorker(languages);
      cachedWorker = worker;
      cachedLanguages = languages;
      return worker;
    } finally {
      isInitializing = false;
    }
  })();

  return await initPromise;
};

/**
 * Extracts text from an image (file path, buffer, or data URL) using Tesseract.js.
 * Supports English ('eng'), Gujarati ('guj'), and Hindi ('hin').
 *
 * @param {string | Buffer} imageInput - Path to the image file, Buffer, or data URL
 * @param {string} languages - Plus-separated language codes, defaults to 'eng'
 * @returns {Promise<{ text: string, confidence: number }>}
 */
export const extractTextFromImage = async (imageInput, languages = 'eng') => {
  try {
    const isDataUrl = typeof imageInput === 'string' && imageInput.startsWith('data:');
    console.log(`[OCR Service] Starting fast OCR for: ${isDataUrl ? '[Base64 Data URL]' : imageInput} (${languages})`);

    let text = '';
    let confidence = 0;

    // Use cached worker if possible, fallback to recognize if worker fails
    try {
      const worker = await getWorker(languages);
      const res = await worker.recognize(imageInput);
      text = res?.data?.text?.trim() || '';
      confidence = Math.round(res?.data?.confidence || 0);
    } catch (workerErr) {
      console.warn('[OCR Service] Cached worker attempt failed, trying direct recognize:', workerErr.message);
      const result = await Tesseract.recognize(imageInput, languages, {
        errorHandler: (err) => console.warn('[OCR Warning]:', err),
      });
      text = result?.data?.text?.trim() || '';
      confidence = Math.round(result?.data?.confidence || 0);
    }

    console.log(`[OCR Service] Completed OCR. Confidence: ${confidence}%, Text length: ${text.length}`);
    return {
      text,
      confidence,
    };
  } catch (error) {
    console.error(`[OCR Service Error with ${languages}]:`, error.message);

    // Resilient fallback: If multilingual packs fail to download or load, fallback to 'eng'
    if (languages !== 'eng') {
      try {
        console.log('[OCR Service] Falling back to default English (eng) pack...');
        const fallbackResult = await Tesseract.recognize(imageInput, 'eng');
        const text = fallbackResult?.data?.text?.trim() || '';
        const confidence = Math.round(fallbackResult?.data?.confidence || 0);
        return {
          text,
          confidence,
        };
      } catch (fbErr) {
        throw new Error(`Multilingual and fallback OCR failed: ${fbErr.message}`);
      }
    }

    throw new Error(`OCR processing failed: ${error.message}`);
  }
};

export default {
  extractTextFromImage,
};
