import React, { useRef, useState } from 'react';

const UploadZone = ({ onUpload, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return;
    }
    onUpload(file, title);
    setTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="glass-panel rounded-2xl border border-[#82aeb1]/15 p-6 mb-8">
      <h2 className="text-lg font-bold text-white mb-4">Upload Document</h2>

      <input
        type="text"
        placeholder="Document title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-[var(--bg-card)]/55 border border-[#82aeb1]/15 focus:border-[#82aeb1] text-white placeholder:text-[var(--text-quaternary)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#82aeb1]/40 mb-4 transition"
        disabled={isUploading}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition duration-200 ${
          isDragging
            ? 'border-[#82aeb1] bg-[#82aeb1]/10'
            : 'border-[#82aeb1]/20 hover:border-[#82aeb1]/50 hover:bg-[#82aeb1]/5'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-[#82aeb1]/30 border-t-[#93c6d6] rounded-full animate-spin mb-3" />
            <p className="text-[var(--text-secondary)] text-sm font-medium">Uploading PDF...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-[#82aeb1]/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#82aeb1]/20">
              <svg className="w-6 h-6 text-[#93c6d6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium">Drag & drop a PDF here, or click to browse</p>
            <p className="text-[var(--text-quaternary)] text-xs mt-1">PDF only · Max 15 MB</p>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
