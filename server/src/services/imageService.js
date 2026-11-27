import sharp from 'sharp';

/**
 * Resizes, compresses, and converts images across JPG, PNG, and WebP formats
 * @param {Buffer} fileBuffer
 * @param {Object} options - { width, height, quality, format, fit, rotate }
 * @returns {Promise<{ buffer: Buffer, info: any, mimeType: string, format: string }>}
 */
export const processImage = async (fileBuffer, options = {}) => {
  let pipeline = sharp(fileBuffer);

  // Auto-rotate based on EXIF orientation
  pipeline = pipeline.rotate();

  // Explicit rotation
  if (options.rotate && Number(options.rotate) !== 0) {
    pipeline = pipeline.rotate(Number(options.rotate));
  }

  // Dimensions
  const width = options.width ? parseInt(options.width, 10) : null;
  const height = options.height ? parseInt(options.height, 10) : null;
  if (width || height) {
    pipeline = pipeline.resize({
      width: width || undefined,
      height: height || undefined,
      fit: options.fit || 'inside',
      withoutEnlargement: true,
    });
  }

  // Format and Quality
  const format = (options.format || 'jpeg').toLowerCase();
  const quality = options.quality ? Math.max(10, Math.min(100, parseInt(options.quality, 10))) : 80;

  let mimeType = 'image/jpeg';
  if (format === 'png') {
    mimeType = 'image/png';
    // Sharp PNG compression level: 0-9
    const compressionLevel = Math.round((100 - quality) / 11);
    pipeline = pipeline.png({ compressionLevel: Math.max(0, Math.min(9, compressionLevel)) });
  } else if (format === 'webp') {
    mimeType = 'image/webp';
    pipeline = pipeline.webp({ quality });
  } else {
    // Default to jpeg
    mimeType = 'image/jpeg';
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    info,
    mimeType,
    format: info.format,
  };
};

/**
 * Compresses an image with preset or custom profiles
 * @param {Buffer} fileBuffer
 * @param {Object} options - { profile: 'low' | 'medium' | 'high', quality?: number, format?: string }
 * @returns {Promise<{ buffer: Buffer, info: any, originalSize: number, newSize: number, savedPercent: number }>}
 */
export const compressImage = async (fileBuffer, options = {}) => {
  const originalSize = fileBuffer.length;
  let quality = 75;

  if (options.quality) {
    quality = parseInt(options.quality, 10);
  } else if (options.profile === 'high') {
    quality = 45; // High compression = smaller size
  } else if (options.profile === 'low') {
    quality = 85; // Low compression = higher quality
  } else {
    quality = 65; // Medium compression
  }

  const format = options.format || 'jpeg';
  const result = await processImage(fileBuffer, { quality, format });
  const newSize = result.buffer.length;
  const savedPercent = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

  return {
    ...result,
    originalSize,
    newSize,
    savedPercent,
  };
};
