import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { sendSuccess, sendError } from './utils/apiResponse.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import chatRoutes from './routes/chat.routes.js';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded PDFs (protected by auth on upload/delete; read-only static)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, 'Server is running smoothly', {
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Multer / upload error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 400, 'File too large. Maximum size is 15 MB.');
  }
  if (err.message === 'Only PDF files are allowed') {
    return sendError(res, 400, err.message);
  }
  console.error(err.stack);
  return sendError(res, 500, 'An unexpected server error occurred', err.message);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
