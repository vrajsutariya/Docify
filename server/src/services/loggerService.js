import { ActivityLog } from '../models/ActivityLog.js';
import { History } from '../models/History.js';

/**
 * Records a system or user action into the central audit trail
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} [params.userId]
 * @param {string} [params.userEmail]
 * @param {string} params.action - e.g. 'USER_LOGIN', 'DOC_UPLOAD', 'QUIZ_TAKEN'
 * @param {'documind'|'datainsight'|'smarttools'|'auth'|'admin'} params.module
 * @param {string} [params.details]
 * @param {string} [params.ipAddress]
 * @param {'success'|'failed'} [params.status='success']
 */
export const logActivity = async ({
  userId = null,
  userEmail = 'Anonymous',
  action,
  module,
  details = '',
  ipAddress = '127.0.0.1',
  status = 'success',
}) => {
  try {
    if (!action || !module) return null;

    const logEntry = await ActivityLog.create({
      userId,
      userEmail,
      action,
      module,
      details,
      ipAddress,
      status,
    });
    return logEntry;
  } catch (err) {
    // Audit logging should never crash the main transaction
    console.warn('[loggerService] Activity log failure:', err.message);
    return null;
  }
};

/**
 * Creates or updates a user timeline history entry
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.userId
 * @param {'document'|'dataset'|'quiz'|'tool_action'} params.itemType
 * @param {any} [params.itemId]
 * @param {string} params.title
 * @param {string} [params.summary]
 * @param {string} [params.action]
 * @param {'documind'|'datainsight'|'smarttools'} params.module
 * @param {Object} [params.metadata]
 */
export const recordHistory = async ({
  userId,
  itemType,
  itemId = null,
  title,
  summary = '',
  action = '',
  module = 'documind',
  metadata = {},
}) => {
  try {
    if (!userId || !title) return null;

    // Check if entry already exists for this itemId and user (to update timestamp)
    if (itemId) {
      const existing = await History.findOne({ userId, itemId });
      if (existing) {
        existing.title = title || existing.title;
        existing.summary = summary || existing.summary;
        existing.action = action || existing.action;
        existing.metadata = { ...existing.metadata, ...metadata };
        existing.updatedAt = new Date();
        await existing.save();
        return existing;
      }
    }

    const newHistory = await History.create({
      userId,
      itemType,
      itemId,
      title,
      summary,
      action,
      module,
      metadata,
    });
    return newHistory;
  } catch (err) {
    console.warn('[loggerService] History recording failure:', err.message);
    return null;
  }
};
