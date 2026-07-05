import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { uploadPdf } from '../config/multer.js';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument
} from '../controllers/document.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.post('/upload', uploadPdf.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
