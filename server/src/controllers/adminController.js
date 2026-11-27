import fs from 'fs';
import path from 'path';
import { User } from '../models/User.js';
import { Document } from '../models/Document.js';
import { Dataset } from '../models/Dataset.js';
import { Quiz } from '../models/Quiz.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { History } from '../models/History.js';
import { logActivity } from '../services/loggerService.js';
import { successResponse, errorResponse } from '../utils/responseWrapper.js';

const uploadsDir = path.resolve(process.cwd(), 'uploads');

/**
 * Calculates current disk size in uploads directory
 * @returns {{ totalBytes: number, totalFiles: number, files: Array<{ name: string, size: number, mtime: Date }> }}
 */
const getUploadsDiskStats = () => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return { totalBytes: 0, totalFiles: 0, files: [] };
    }

    const fileNames = fs.readdirSync(uploadsDir);
    let totalBytes = 0;
    const files = [];

    fileNames.forEach((file) => {
      try {
        const filePath = path.join(uploadsDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          totalBytes += stat.size;
          files.push({
            name: file,
            size: stat.size,
            mtime: stat.mtime,
          });
        }
      } catch (_) {}
    });

    return { totalBytes, totalFiles: files.length, files };
  } catch (err) {
    console.warn('[adminController] Disk stat check failed:', err.message);
    return { totalBytes: 0, totalFiles: 0, files: [] };
  }
};

/**
 * @route   GET /api/admin/stats
 * @desc    Get high-level system telemetry, storage, and 7-day trend metrics
 * @access  Admin only
 */
export const getSystemStats = async (req, res, next) => {
  try {
    const [totalUsers, totalDocs, totalDatasets, totalQuizzes, totalLogs] = await Promise.all([
      User.countDocuments(),
      Document.countDocuments(),
      Dataset.countDocuments(),
      Quiz.countDocuments(),
      ActivityLog.countDocuments(),
    ]);

    // Calculate active users in the past 24 hours from logs
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeTodayLogs = await ActivityLog.distinct('userId', {
      createdAt: { $gte: oneDayAgo },
      userId: { $ne: null },
    });
    const activeUsersToday = activeTodayLogs.length;

    // Physical disk storage in uploads
    const diskStats = getUploadsDiskStats();
    const diskStorageMb = (diskStats.totalBytes / (1024 * 1024)).toFixed(2);

    // Sum of user storage quotas
    const userStorageSum = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$storageUsedBytes' } } },
    ]);
    const quotaStorageMb = ((userStorageSum[0]?.total || 0) / (1024 * 1024)).toFixed(2);

    // Module breakdown for pie/donut charts
    const moduleBreakdown = [
      { name: 'DocuMind (PDFs)', count: totalDocs, bytes: Math.round(diskStats.totalBytes * 0.6) },
      { name: 'DataInsight (Datasets)', count: totalDatasets, bytes: Math.round(diskStats.totalBytes * 0.25) },
      { name: 'Quizzes & Flashcards', count: totalQuizzes, bytes: Math.round(diskStats.totalBytes * 0.05) },
      { name: 'SmartTools Temp', count: Math.max(0, diskStats.totalFiles - totalDocs - totalDatasets), bytes: Math.round(diskStats.totalBytes * 0.1) },
    ];

    // Weekly growth trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyLogs = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          actions: { $sum: 1 },
          uploads: {
            $sum: {
              $cond: [{ $in: ['$action', ['DOC_UPLOAD', 'DATASET_UPLOAD']] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return successResponse(
      res,
      {
        stats: {
          totalUsers,
          totalDocuments: totalDocs,
          totalDatasets,
          totalQuizzes,
          activeUsersToday,
          totalActivities: totalLogs,
          storage: {
            usedBytes: diskStats.totalBytes,
            usedMb: parseFloat(diskStorageMb),
            quotaMb: parseFloat(quotaStorageMb),
            totalFiles: diskStats.totalFiles,
            limitMb: 5120, // 5 GB default platform capacity
          },
        },
        moduleBreakdown,
        weeklyTrend: weeklyLogs.map((d) => ({
          date: d._id,
          actions: d.actions,
          uploads: d.uploads,
        })),
      },
      'System statistics retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Paginated list of registered users with search, role filtering, and sort
 * @access  Admin only
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || req.query.q || '';
    const role = req.query.role;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    // Fetch user document count in batch
    const userIds = users.map((u) => u._id);
    const docCounts = await Document.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const docCountMap = {};
    docCounts.forEach((d) => (docCountMap[d._id.toString()] = d.count));

    const enrichedUsers = users.map((u) => ({
      ...u.toJSON(),
      documentsCount: docCountMap[u._id.toString()] || 0,
    }));

    return successResponse(
      res,
      {
        users: enrichedUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Users retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Update user role (user <-> admin)
 * @access  Admin only
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return errorResponse(res, "Invalid role. Allowed values: 'user', 'admin'", 400);
    }

    const currentAdminId = req.user?.id || req.user?._id;
    if (id === currentAdminId && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return errorResponse(res, 'Cannot revoke your own admin role as the only administrator.', 400);
      }
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await logActivity({
      userId: currentAdminId,
      userEmail: req.user?.email || 'admin',
      action: 'USER_ROLE_UPDATE',
      module: 'admin',
      details: `Changed role of ${user.email} to ${role}`,
    });

    return successResponse(res, { user }, `User role updated to ${role}`);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Permanently delete a user and their associated documents, datasets, and disk files
 * @access  Admin only
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user?.id || req.user?._id;

    if (id === currentAdminId) {
      return errorResponse(res, 'You cannot delete your own admin account.', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // 1. Delete user's documents & disk files
    const userDocs = await Document.find({ userId: id });
    userDocs.forEach((doc) => {
      if (doc.filePath && fs.existsSync(doc.filePath)) {
        try {
          fs.unlinkSync(doc.filePath);
        } catch (_) {}
      }
    });
    await Document.deleteMany({ userId: id });

    // 2. Delete user's datasets & disk files
    const userDatasets = await Dataset.find({ userId: id });
    userDatasets.forEach((ds) => {
      if (ds.filePath && fs.existsSync(ds.filePath)) {
        try {
          fs.unlinkSync(ds.filePath);
        } catch (_) {}
      }
    });
    await Dataset.deleteMany({ userId: id });

    // 3. Delete quizzes & history
    await Quiz.deleteMany({ userId: id });
    await History.deleteMany({ userId: id });

    // 4. Delete user record
    await User.findByIdAndDelete(id);

    await logActivity({
      userId: currentAdminId,
      userEmail: req.user?.email || 'admin',
      action: 'USER_DELETE',
      module: 'admin',
      details: `Deleted user ${user.email} and purged all associated data`,
    });

    return successResponse(res, null, `User ${user.email} and all data purged successfully.`);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/logs
 * @desc    Paginated system audit logs with module/action filters
 * @access  Admin only
 */
export const getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { module, action, status, search } = req.query;

    const filter = {};
    if (module && module !== 'all') filter.module = module;
    if (action && action !== 'all') filter.action = action;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return successResponse(
      res,
      {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Activity logs retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/storage
 * @desc    Detailed storage breakdown and list of uploaded files
 * @access  Admin only
 */
export const getStorageAnalytics = async (req, res, next) => {
  try {
    const diskStats = getUploadsDiskStats();
    return successResponse(
      res,
      {
        totalBytes: diskStats.totalBytes,
        totalMb: (diskStats.totalBytes / (1024 * 1024)).toFixed(2),
        totalFiles: diskStats.totalFiles,
        files: diskStats.files.slice(0, 50), // Return recent 50
      },
      'Storage analytics retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/admin/cleanup-storage
 * @desc    Scans uploads/ and removes orphaned temporary files not linked to documents/datasets
 * @access  Admin only
 */
export const cleanupStorage = async (req, res, next) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return successResponse(res, { cleanedFilesCount: 0, freedBytes: 0, freedMb: 0 }, 'Uploads directory is empty.');
    }

    // Get active file paths from Document and Dataset
    const [docs, datasets] = await Promise.all([
      Document.find().select('filePath'),
      Dataset.find().select('filePath'),
    ]);

    const activeBaseNames = new Set();
    docs.forEach((d) => d.filePath && activeBaseNames.add(path.basename(d.filePath)));
    datasets.forEach((ds) => ds.filePath && activeBaseNames.add(path.basename(ds.filePath)));

    const fileNames = fs.readdirSync(uploadsDir);
    let cleanedFilesCount = 0;
    let freedBytes = 0;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    fileNames.forEach((file) => {
      // If file is not in active database records AND is older than 2 hours or is a temporary tool file
      const isLinked = activeBaseNames.has(file);
      if (!isLinked) {
        try {
          const filePath = path.join(uploadsDir, file);
          const stat = fs.statSync(filePath);
          // Delete temp files or files unreferenced for > 2 hours
          if (now - stat.mtimeMs > 2 * 60 * 60 * 1000 || file.startsWith('docify-')) {
            freedBytes += stat.size;
            fs.unlinkSync(filePath);
            cleanedFilesCount++;
          }
        } catch (_) {}
      }
    });

    const freedMb = (freedBytes / (1024 * 1024)).toFixed(2);

    await logActivity({
      userId: req.user?.id || req.user?._id,
      userEmail: req.user?.email || 'admin',
      action: 'STORAGE_CLEANUP',
      module: 'admin',
      details: `Purged ${cleanedFilesCount} orphaned files, freed ${freedMb} MB`,
    });

    return successResponse(
      res,
      {
        cleanedFilesCount,
        freedBytes,
        freedMb: parseFloat(freedMb),
      },
      `Storage cleanup complete: ${cleanedFilesCount} files removed, ${freedMb} MB freed.`
    );
  } catch (err) {
    next(err);
  }
};
