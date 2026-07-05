import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { validateRegisterInput, validateLoginInput } from '../validation/auth.validation.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Register a new user
 * Route: POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
      return sendError(res, 400, 'Validation failed', errors);
    }

    const { username, email, password } = req.body;

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return sendError(res, 400, 'A user with this email already exists', { email: 'Email is already taken' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return sendError(res, 400, 'A user with this username already exists', { username: 'Username is already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Response user object (omit password)
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt
    };

    return sendSuccess(res, 201, 'User registered successfully', {
      user: userResponse,
      token
    });
  } catch (error) {
    return sendError(res, 500, 'Registration failed', error);
  }
};

/**
 * Log in an existing user
 * Route: POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
      return sendError(res, 400, 'Validation failed', errors);
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password', { general: 'Incorrect email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password', { general: 'Incorrect email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    return sendSuccess(res, 200, 'Login successful', {
      user: userResponse,
      token
    });
  } catch (error) {
    return sendError(res, 500, 'Login failed', error);
  }
};

/**
 * Get logged-in user profile details
 * Route: GET /api/auth/me
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'User profile retrieved successfully', user);
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve profile data', error);
  }
};

