import Tesseract from 'tesseract.js';

/**
 * Extracts text from an image (file path, buffer, or data URL) using Tesseract.js.
 * Supports English ('eng'), Gujarati ('guj'), and Hindi ('hin').
 *
 * @param {string | Buffer} imageInput - Path to the image file, Buffer, or data URL
 * @param {string} languages - Plus-separated language codes, defaults to 'eng+guj+hin'
 * @returns {Promise<{ text: string, confidence: number }>}
 */
export const extractTextFromImage = async (imageInput, languages = 'eng+guj+hin') => {
  try {
    const isDataUrl = typeof imageInput === 'string' && imageInput.startsWith('data:');
    console.log(`[OCR Service] Starting OCR for: ${isDataUrl ? '[Base64 Data URL]' : imageInput} with languages: ${languages}`);
    const result = await Tesseract.recognize(imageInput, languages, {
      errorHandler: (err) => console.warn('[OCR Warning]:', err),
    });

    const text = result?.data?.text?.trim() || '';
    const confidence = Math.round(result?.data?.confidence || 0);

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
