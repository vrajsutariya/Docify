import { errorResponse } from '../utils/responseWrapper.js';
import { User } from '../models/User.js';

/**
 * Middleware to restrict route execution exclusively to verified administrators
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // 1. Ensure user is authenticated
    if (!req.user && !req.currentUser) {
      return errorResponse(res, 'Authentication required to access admin resources.', 401);
    }

    const userId = req.user?.id || req.user?._id || req.currentUser?._id;
    let role = req.user?.role || req.currentUser?.role;

    // If role isn't populated on token or might be stale, query User model
    if (!role && userId) {
      const user = await User.findById(userId).select('role');
      role = user?.role;
    }

    if (role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin privileges required.', 403);
    }

    next();
  } catch (err) {
    console.error('[adminMiddleware] Error validating admin privileges:', err.message);
    return errorResponse(res, 'Authorization error occurred while verifying privileges.', 500);
  }
};

export default requireAdmin;
