import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  Uploading: 'bg-[#a7acd9]/10 text-[#c7cbec] border-[#a7acd9]/30',
  Processing: 'bg-[#82aeb1]/10 text-[#93c6d6] border-[#82aeb1]/30 animate-pulse-glow',
  Ready: 'bg-[#82aeb1]/10 text-[#93c6d6] border-[#82aeb1]/30',
  Failed: 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

const DocumentCard = ({ document, onDelete, isDeleting }) => {
  const isReady = document.status === 'Ready';

  return (
    <div className="glass-panel rounded-2xl border border-[var(--border-neutral-strong)] p-5 hover:border-[#82aeb1]/40 transition duration-300 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#82aeb1]/10 border border-[#82aeb1]/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#93c6d6]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z" />
            </svg>
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-white truncate">{document.title}</h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {formatDate(document.createdAt)}
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border shrink-0 ${
            STATUS_STYLES[document.status] || STATUS_STYLES.Uploading
          }`}
        >
          {document.status}
        </span>
      </div>

      {document.summary && (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
          {document.summary}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[var(--bg-elevated)]/40 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">Size</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {formatBytes(document.size)}
          </p>
        </div>

        <div className="bg-[var(--bg-elevated)]/40 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">Pages</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {document.stats?.pages || 0}
          </p>
        </div>

        <div className="bg-[var(--bg-elevated)]/40 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">Chunks</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {document.stats?.chunks || 0}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {isReady ? (
          <Link
            to={`/chat/${document._id}`}
            className="flex-1 text-center py-2.5 bg-[#82aeb1]/15 hover:bg-[#82aeb1]/25 border border-[#82aeb1]/30 text-[#93c6d6] rounded-xl text-sm font-semibold transition duration-200"
          >
            Open Chat
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 py-2.5 bg-[var(--bg-elevated)]/50 border border-[var(--border-neutral-strong)] text-[var(--text-quaternary)] rounded-xl text-sm font-semibold cursor-not-allowed"
          >
            {document.status === 'Failed'
              ? 'Processing Failed'
              : 'Processing...'}
          </button>
        )}

        <button
          onClick={() => onDelete(document._id)}
          disabled={isDeleting}
          className="px-4 py-2.5 bg-[var(--danger-bg)] hover:bg-[var(--danger-bg-hover)] border border-[var(--danger-border)] text-[var(--danger-text)] rounded-xl text-sm font-semibold transition duration-200 cursor-pointer disabled:opacity-50"
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
