import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseWrapper.js';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication token missing or invalid format', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'docify_jwt_super_secret_production_ready_key_987654321';
    const decoded = jwt.verify(token, jwtSecret);

    // Attach basic decoded payload
    req.user = decoded;

    // Verify user still exists in database
    const user = await User.findById(decoded.id || decoded._id).select('-password');
    if (!user) {
      return errorResponse(res, 'User associated with this token no longer exists', 401);
    }

    req.currentUser = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid, expired, or malformed authentication token', 401, error);
  }
};

export default requireAuth;
