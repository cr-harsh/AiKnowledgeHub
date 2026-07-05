import Chat from '../models/chat.model.js';
import Document from '../models/document.model.js';
import { chatWithDocument } from '../services/ai.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { validateChatInput } from '../validation/chat.validation.js';

const VALID_MODES = ['ask', 'summarize', 'explain', 'key_points', 'interview_questions'];

/**
 * POST /api/chat/:documentId
 * Single chat endpoint — mode selects the prompt template in FastAPI.
 */
export const sendChatMessage = async (req, res) => {
  try {
    const { errors, isValid } = validateChatInput(req.body);
    if (!isValid) {
      return sendError(res, 400, 'Validation failed', errors);
    }

    const { question, mode = 'ask' } = req.body;
    const { documentId } = req.params;

    if (!VALID_MODES.includes(mode)) {
      return sendError(res, 400, 'Invalid chat mode');
    }

    const document = await Document.findOne({ _id: documentId, userId: req.user.id });
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }

    if (document.status !== 'Ready') {
      return sendError(res, 400, `Document is not ready for chat. Current status: ${document.status}`);
    }

    const aiResponse = await chatWithDocument(req.user.id, documentId, question, mode);

    const chat = await Chat.create({
      userId: req.user.id,
      documentId,
      mode,
      question: mode === 'ask' ? question : '',
      answer: aiResponse.answer,
      sourceChunks: aiResponse.sourceChunks || []
    });

    return sendSuccess(res, 200, 'Chat response generated', {
      chat,
      answer: aiResponse.answer,
      sourceChunks: aiResponse.sourceChunks
    });
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    return sendError(res, 500, 'Chat request failed', message);
  }
};

/**
 * GET /api/chat/:documentId
 * Retrieve chat history for a document.
 */
export const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({ _id: documentId, userId: req.user.id });
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }

    const chats = await Chat.find({ userId: req.user.id, documentId }).sort({ createdAt: 1 });

    return sendSuccess(res, 200, 'Chat history retrieved', { chats, document });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve chat history', error.message);
  }
};

/**
 * DELETE /api/chat/:documentId
 * Clear all chat messages for a document.
 */
export const clearChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({ _id: documentId, userId: req.user.id });
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }

    await Chat.deleteMany({ userId: req.user.id, documentId });

    return sendSuccess(res, 200, 'Chat history cleared');
  } catch (error) {
    return sendError(res, 500, 'Failed to clear chat history', error.message);
  }
};
