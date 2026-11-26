import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseWrapper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'docify_jwt_super_secret_production_ready_key_987654321';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, preferredLanguage, theme } = req.body;

    // Validation
    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email, and password', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long', 400);
    }

    // Check duplicate
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', 409);
    }

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      preferredLanguage: preferredLanguage && ['en', 'gu', 'hi'].includes(preferredLanguage) ? preferredLanguage : 'en',
      theme: theme && ['dark', 'light'].includes(theme) ? theme : 'dark',
    });

    const token = generateToken(newUser);

    return successResponse(
      res,
      {
        user: newUser.toJSON(),
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return errorResponse(res, error.message || 'Registration failed', 500, error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials & issue JWT
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide both email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user);

    return successResponse(
      res,
      {
        user: user.toJSON(),
        token,
      },
      'Logged in successfully'
    );
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return errorResponse(res, error.message || 'Login failed', 500, error);
  }
};

/**
 * @route   POST /api/auth/guest
 * @desc    Generate guest session token with temporary user profile
 * @access  Public
 */
export const guestLogin = async (req, res) => {
  try {
    const guestEmail = 'guest@docify.demo';
    let user = await User.findOne({ email: guestEmail });

    if (!user) {
      user = await User.create({
        name: 'Guest Explorer',
        email: guestEmail,
        password: 'GuestPassword123!',
        role: 'user',
        preferredLanguage: 'en',
        theme: 'dark',
      });
    }

    const token = generateToken(user);

    return successResponse(
      res,
      {
        user: user.toJSON(),
        token,
      },
      'Guest session established successfully'
    );
  } catch (error) {
    console.error('[Auth GuestLogin Error]:', error);
    return errorResponse(res, error.message || 'Guest session initialization failed', 500, error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged-in user profile
 * @access  Protected
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user: user.toJSON() }, 'User profile retrieved');
  } catch (error) {
    console.error('[Auth GetMe Error]:', error);
    return errorResponse(res, 'Failed to fetch user profile', 500, error);
  }
};

/**
 * @route   PUT /api/auth/preferences
 * @desc    Update user language and theme preferences
 * @access  Protected
 */
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { preferredLanguage, theme } = req.body;

    const updates = {};
    if (preferredLanguage && ['en', 'gu', 'hi'].includes(preferredLanguage)) {
      updates.preferredLanguage = preferredLanguage;
    }
    if (theme && ['dark', 'light'].includes(theme)) {
      updates.theme = theme;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(
      res,
      { user: updatedUser.toJSON() },
      'User preferences updated successfully'
    );
  } catch (error) {
    console.error('[Auth UpdatePreferences Error]:', error);
    return errorResponse(res, 'Failed to update preferences', 500, error);
  }
};
