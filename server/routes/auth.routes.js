import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public auth endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected endpoints
router.get('/me', protect, getUserProfile);

export default router;
