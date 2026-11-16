import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastItem {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'warning';
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastItem['tone']) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, tone: ToastItem['tone'] = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 100);
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-white transition-all duration-300 ${
              toast.tone === 'warning'
                ? 'bg-tertiary-container'
                : toast.tone === 'info'
                ? 'bg-primary'
                : 'bg-inverse-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-secondary-fixed shrink-0">
              {toast.tone === 'warning' ? 'info' : 'check_circle'}
            </span>
            <span className="font-label-md text-label-md leading-snug">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
