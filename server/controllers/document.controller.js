import Document from '../models/document.model.js';
import Chat from '../models/chat.model.js';
import { processDocumentWithAI, deleteDocumentVectors } from '../services/ai.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import fs from 'fs';
import path from 'path';

/**
 * Background job: sends PDF to FastAPI, updates MongoDB with results.
 */
const runDocumentProcessing = async (documentId, filePath, userId, originalFilename) => {
  try {
    await Document.findByIdAndUpdate(documentId, { status: 'Processing' });

    const result = await processDocumentWithAI(filePath, userId, documentId, originalFilename);

    await Document.findByIdAndUpdate(documentId, {
      status: 'Ready',
      summary: result.summary || '',
      stats: {
        pages: result.pages || 0,
        chunks: result.chunks || 0,
        wordCount: result.wordCount || 0
      }
    });
  } catch (error) {
    console.error(`Document processing failed [${documentId}]:`, error.message);
    await Document.findByIdAndUpdate(documentId, { status: 'Failed' });
  }
};

/**
 * GET /api/documents
 * List all documents for the logged-in user (optional search query).
 */
export const getDocuments = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { userId: req.user.id };

    if (search && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Documents retrieved successfully', { documents });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve documents', error.message);
  }
};

/**
 * GET /api/documents/:id
 * Get a single document by ID (must belong to user).
 */
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }
    return sendSuccess(res, 200, 'Document retrieved successfully', { document });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve document', error.message);
  }
};

/**
 * POST /api/documents/upload
 * Upload a PDF, save metadata, and trigger async AI processing.
 */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No PDF file provided');
    }

    const title = req.body.title?.trim() || req.file.originalname.replace(/\.pdf$/i, '');

    const document = await Document.create({
      userId: req.user.id,
      title,
      filename: req.file.filename,
      fileUrl: `/uploads/${req.user.id}/${req.file.filename}`,
      size: req.file.size,
      status: 'Uploading'
    });

    // Respond immediately — processing continues in the background
    runDocumentProcessing(
      document._id,
      req.file.path,
      req.user.id,
      req.file.originalname
    );

    return sendSuccess(res, 201, 'Document uploaded successfully. Processing started.', { document });
  } catch (error) {
    // Clean up uploaded file if DB insert failed
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return sendError(res, 500, 'Document upload failed', error.message);
  }
};

/**
 * DELETE /api/documents/:id
 * Remove document file, vector index, chat history, and DB record.
 */
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }

    // Delete PDF from disk
    const filePath = path.join(process.cwd(), 'uploads', req.user.id, document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete FAISS vectors via AI service (best-effort)
    try {
      await deleteDocumentVectors(req.user.id, document._id);
    } catch (err) {
      console.warn(`Vector cleanup failed for ${document._id}:`, err.message);
    }

    // Delete associated chat history
    await Chat.deleteMany({ documentId: document._id, userId: req.user.id });

    await Document.findByIdAndDelete(document._id);

    return sendSuccess(res, 200, 'Document deleted successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete document', error.message);
  }
};
