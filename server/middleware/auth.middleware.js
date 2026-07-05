import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';

/**
 * JWT Authentication Middleware
 * Checks for Bearer token in the Authorization header.
 */
export const protect = (req, res, next) => {
  let token;

  // Check if header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Split header to get token
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded user info to the request object
      req.user = decoded; // Contains id and username

      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return sendError(res, 401, 'Not authorized, token validation failed');
    }
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, no token provided');
  }
};
