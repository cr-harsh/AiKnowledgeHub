import api from './api';

export const documentService = {
  getAll: (search = '') =>
    api.get('/documents', { params: search ? { search } : {} }),

  getById: (id) => api.get(`/documents/${id}`),

  upload: (file, title = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  delete: (id) => api.delete(`/documents/${id}`)
};

export const chatService = {
  getHistory: (documentId) => api.get(`/chat/${documentId}`),

  send: (documentId, question, mode = 'ask') =>
    api.post(`/chat/${documentId}`, { question, mode }),

  clear: (documentId) => api.delete(`/chat/${documentId}`)
};
