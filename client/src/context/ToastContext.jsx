import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ToastItem = ({ toast, onRemove }) => (
  <div
    className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md animate-fade-in min-w-[280px] max-w-sm ${
      toast.type === 'success'
        ? 'bg-[#82aeb1]/15 border-[#82aeb1]/35 text-[#d9f3f5]'
        : toast.type === 'error'
        ? 'bg-[var(--danger-bg-solid)]/90 border-[var(--danger-border)] text-[var(--danger-text-hover)]'
        : 'bg-[var(--bg-card)]/90 border-[#82aeb1]/20 text-[var(--text-primary)]'
    }`}
  >
    <div className="flex-1 text-sm font-medium">{toast.message}</div>
    <button
      onClick={() => onRemove(toast.id)}
      className="text-[var(--text-tertiary)] hover:text-[#93c6d6] transition cursor-pointer shrink-0"
    >
      ✕
    </button>
  </div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
