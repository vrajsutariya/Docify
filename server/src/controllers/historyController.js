import { History } from '../models/History.js';
import { Document } from '../models/Document.js';
import { Dataset } from '../models/Dataset.js';
import { Quiz } from '../models/Quiz.js';
import { User } from '../models/User.js';
import { logActivity } from '../services/loggerService.js';
import { successResponse, errorResponse } from '../utils/responseWrapper.js';

/**
 * @route   GET /api/history
 * @desc    Get user's chronological activity timeline with filtering
 * @access  Protected
 */
export const getUserHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { module, itemType, search } = req.query;

    const filter = { userId };
    if (module && module !== 'all') filter.module = module;
    if (itemType && itemType !== 'all') filter.itemType = itemType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    let total = await History.countDocuments(filter);
    let items = await History.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // If history is empty, populate from existing user documents/datasets/quizzes for immediate value
    if (items.length === 0 && page === 1 && !search && (!module || module === 'all')) {
      const [docs, datasets, quizzes] = await Promise.all([
        Document.find({ userId }).sort({ createdAt: -1 }).limit(5),
        Dataset.find({ userId }).sort({ createdAt: -1 }).limit(5),
        Quiz.find({ userId }).sort({ createdAt: -1 }).limit(5),
      ]);

      const initialEntries = [];

      docs.forEach((doc) => {
        initialEntries.push({
          userId,
          itemType: 'document',
          itemId: doc._id,
          title: doc.originalName || doc.title,
          summary: `${doc.pageCount || 1} pages, ${(doc.fileSize / 1024).toFixed(1)} KB`,
          action: 'Document Analysis & Abstract',
          module: 'documind',
          isFavorite: doc.isFavorite || false,
        });
      });

      datasets.forEach((ds) => {
        initialEntries.push({
          userId,
          itemType: 'dataset',
          itemId: ds._id,
          title: ds.originalName || ds.name,
          summary: `${ds.rowCount || 0} rows, ${ds.columnCount || 0} columns`,
          action: 'Data Profiling & Visualization',
          module: 'datainsight',
          isFavorite: ds.isFavorite || false,
        });
      });

      quizzes.forEach((q) => {
        initialEntries.push({
          userId,
          itemType: 'quiz',
          itemId: q._id,
          title: q.title || 'Knowledge Assessment',
          summary: `${q.questions?.length || 0} questions`,
          action: 'Quiz Generated',
          module: 'documind',
          isFavorite: q.isFavorite || false,
        });
      });

      if (initialEntries.length > 0) {
        await History.insertMany(initialEntries);
        total = await History.countDocuments(filter);
        items = await History.find(filter).sort({ createdAt: -1 }).limit(limit);
      }
    }

    return successResponse(
      res,
      {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'User history retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/history/favorite/:id
 * @desc    Toggle favorite / bookmark status on any history entry or document
 * @access  Protected
 */
export const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    // 1. Try finding in History model
    let historyItem = await History.findOne({ _id: id, userId });

    if (!historyItem) {
      // 2. Try finding by itemId (e.g. Document ID, Dataset ID, Quiz ID)
      historyItem = await History.findOne({ itemId: id, userId });
    }

    if (historyItem) {
      historyItem.isFavorite = !historyItem.isFavorite;
      await historyItem.save();

      // Sync with parent entity if applicable
      if (historyItem.itemType === 'document' && historyItem.itemId) {
        await Document.findByIdAndUpdate(historyItem.itemId, { isFavorite: historyItem.isFavorite });
      } else if (historyItem.itemType === 'dataset' && historyItem.itemId) {
        await Dataset.findByIdAndUpdate(historyItem.itemId, { isFavorite: historyItem.isFavorite });
      }

      await logActivity({
        userId,
        userEmail: req.user?.email,
        action: historyItem.isFavorite ? 'FAVORITE_ADD' : 'FAVORITE_REMOVE',
        module: historyItem.module || 'documind',
        details: `${historyItem.isFavorite ? 'Pinned' : 'Unpinned'} ${historyItem.title}`,
      });

      return successResponse(
        res,
        { item: historyItem },
        historyItem.isFavorite ? 'Added to favorites' : 'Removed from favorites'
      );
    }

    // 3. If item doesn't exist in history yet, check if it's a Document or Dataset
    const doc = await Document.findOne({ _id: id, userId });
    if (doc) {
      doc.isFavorite = !doc.isFavorite;
      await doc.save();

      const created = await History.create({
        userId,
        itemType: 'document',
        itemId: doc._id,
        title: doc.originalName || doc.title,
        summary: `${doc.pageCount || 1} pages`,
        action: 'Document Analysis',
        module: 'documind',
        isFavorite: doc.isFavorite,
      });

      return successResponse(
        res,
        { item: created },
        doc.isFavorite ? 'Added to favorites' : 'Removed from favorites'
      );
    }

    return errorResponse(res, 'Item not found to toggle favorite.', 404);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/history/favorites
 * @desc    Get all bookmarked / starred items for quick 1-click access
 * @access  Protected
 */
export const getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const favorites = await History.find({ userId, isFavorite: true }).sort({ updatedAt: -1, createdAt: -1 });

    return successResponse(res, { favorites }, 'Favorites retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/history/clear
 * @desc    Clear user activity timeline (preserves favorites by default)
 * @access  Protected
 */
export const clearUserHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { includeFavorites = false } = req.body;

    const condition = { userId };
    if (!includeFavorites) {
      condition.isFavorite = { $ne: true };
    }

    const result = await History.deleteMany(condition);

    await logActivity({
      userId,
      userEmail: req.user?.email,
      action: 'HISTORY_CLEARED',
      module: 'documind',
      details: `Cleared ${result.deletedCount} history entries`,
    });

    return successResponse(
      res,
      { deletedCount: result.deletedCount },
      'History cleared successfully'
    );
  } catch (err) {
    next(err);
  }
};
