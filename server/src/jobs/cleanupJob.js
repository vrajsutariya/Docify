import fs from 'fs/promises';
import path from 'path';

/**
 * Cleanup files older than maxAgeMs in the server/uploads directory
 */
export const cleanupUploads = async (maxAgeMs = 24 * 60 * 60 * 1000) => {
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const now = Date.now();

  try {
    const files = await fs.readdir(uploadsDir);
    let removedCount = 0;

    for (const file of files) {
      if (file === '.gitkeep') continue;

      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > maxAgeMs) {
        await fs.unlink(filePath);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`[CleanupJob] Cleaned up ${removedCount} stale temporary files.`);
    }
  } catch (err) {
    console.error('[CleanupJob] Error during upload cleanup routine:', err.message);
  }
};

/**
 * Initializes periodic cleanup interval
 */
export const initCleanupScheduler = (intervalMs = 60 * 60 * 1000) => {
  // Run once on startup
  cleanupUploads().catch(() => {});
  // Schedule recurring interval
  return setInterval(() => {
    cleanupUploads().catch(() => {});
  }, intervalMs);
};
