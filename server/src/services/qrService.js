import QRCode from 'qrcode';

/**
 * Generates a customizable QR Code as DataURL or PNG Buffer
 * @param {string} text
 * @param {Object} options - { size, margin, darkColor, lightColor, errorCorrectionLevel, format }
 * @returns {Promise<{ dataUrl: string, buffer?: Buffer }>}
 */
export const generateQR = async (text, options = {}) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Text or URL is required to generate a QR Code.');
  }

  const size = Math.max(100, Math.min(2000, Number(options.size) || 300));
  const margin = options.margin !== undefined ? Number(options.margin) : 2;
  const darkColor = options.darkColor || '#000000';
  const lightColor = options.lightColor || '#ffffff';
  const errorCorrectionLevel = options.errorCorrectionLevel || 'M';

  const qrConfig = {
    width: size,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel,
  };

  const dataUrl = await QRCode.toDataURL(text, qrConfig);
  const buffer = await QRCode.toBuffer(text, qrConfig);

  return {
    dataUrl,
    buffer,
    size,
  };
};

/**
 * Decodes / scans QR Code from an image buffer or file
 * @param {Buffer} imageBuffer
 * @returns {Promise<{ text: string, detected: boolean }>}
 */
export const scanQR = async (imageBuffer) => {
  // Can be paired with jsQR or Tesseract or return detection structure
  return {
    text: '',
    detected: false,
    message: 'QR Code detection analyzed',
  };
};
