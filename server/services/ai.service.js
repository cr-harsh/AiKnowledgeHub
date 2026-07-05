import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Sends a PDF to the FastAPI service for embedding + FAISS indexing.
 */
export const processDocumentWithAI = async (filePath, userId, documentId, originalFilename) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath), {
    filename: originalFilename,
    contentType: 'application/pdf'
  });
  formData.append('userId', userId.toString());
  formData.append('documentId', documentId.toString());

  const response = await axios.post(`${AI_SERVICE_URL}/process-document`, formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 300000 // 5 min — embedding large PDFs can take time
  });

  return response.data;
};

/**
 * Queries the RAG pipeline for a specific document.
 */
export const chatWithDocument = async (userId, documentId, question, mode = 'ask') => {
  const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
    userId: userId.toString(),
    documentId: documentId.toString(),
    question,
    mode
  }, {
    timeout: 120000
  });

  return response.data;
};

/**
 * Removes the FAISS vector index for a document.
 */
export const deleteDocumentVectors = async (userId, documentId) => {
  const response = await axios.delete(
    `${AI_SERVICE_URL}/document/${userId}/${documentId}`,
    { timeout: 30000 }
  );
  return response.data;
};

/**
 * Health check for the AI microservice.
 */
export const checkAIServiceHealth = async () => {
  const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 5000 });
  return response.data;
};
