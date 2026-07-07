import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import UploadZone from '../components/UploadZone';
import DocumentCard from '../components/DocumentCard';
import { documentService } from '../services/documentService';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDocuments = useCallback(async (searchQuery = '') => {
    try {
      const response = await documentService.getAll(searchQuery);
      if (response.data.success) {
        setDocuments(response.data.data.documents);
      }
    } catch (err) {
      addToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDocuments(search);
  }, [fetchDocuments, search]);

  // Poll for status updates while any document is processing
  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.status === 'Uploading' || d.status === 'Processing'
    );
    if (!hasProcessing) return;

    const interval = setInterval(() => fetchDocuments(search), 4000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments, search]);

  const handleUpload = async (file, title) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      addToast('Only PDF files are supported', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const response = await documentService.upload(file, title);
      if (response.data.success) {
        addToast('Document uploaded! AI processing started.', 'success');
        await fetchDocuments(search);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document and all its chat history?')) return;

    setDeletingId(id);
    try {
      const response = await documentService.delete(id);
      if (response.data.success) {
        addToast('Document deleted', 'success');
        setDocuments((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) return null;

  const readyCount = documents.filter((d) => d.status === 'Ready').length;

  return (
    <Layout className="overflow-y-auto">
      <main className="p-4 md:p-8 relative">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#82aeb1]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto animate-fade-in relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome, {user.username}!
              </h1>
              <p className="text-[var(--text-secondary)] mt-1 text-sm">
                {documents.length === 0
                  ? 'Upload your first PDF to start chatting with AI.'
                  : `${readyCount} of ${documents.length} documents ready for chat`}
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-card)]/55 border border-[#82aeb1]/15 focus:border-[#82aeb1] text-white placeholder:text-[var(--text-quaternary)] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#82aeb1]/40 transition"
              />
            </div>
          </div>

          <UploadZone onUpload={handleUpload} isUploading={isUploading} />

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-[#82aeb1]/30 border-t-[#93c6d6] rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-[#82aeb1]/15 p-12 text-center">
              <p className="text-[var(--text-secondary)] text-sm">
                No documents found. Upload a PDF to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  document={doc}
                  onDelete={handleDelete}
                  isDeleting={deletingId === doc._id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
