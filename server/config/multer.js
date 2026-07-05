import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

/**
 * Ensures the per-user upload directory exists before saving files.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(UPLOADS_ROOT, req.user.id);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

export const uploadPdf = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB max
});

export { UPLOADS_ROOT };
