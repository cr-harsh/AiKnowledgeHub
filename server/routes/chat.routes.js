import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory
} from '../controllers/chat.controller.js';

const router = express.Router();

router.use(protect);

router.get('/:documentId', getChatHistory);
router.post('/:documentId', sendChatMessage);
router.delete('/:documentId', clearChatHistory);

export default router;
