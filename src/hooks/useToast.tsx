"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success', duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Auto-remove toasts
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    });
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

// Toast Component
export const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            flex items-start gap-3
            px-5 py-4 rounded-xl
            shadow-2xl
            min-w-[320px]
            max-w-md
            animate-in slide-in-from-right duration-300
            ${toast.type === 'success' ? 'bg-white border-l-4 border-green-500' : ''}
            ${toast.type === 'error' ? 'bg-white border-l-4 border-red-500' : ''}
            ${toast.type === 'warning' ? 'bg-white border-l-4 border-amber-500' : ''}
            ${toast.type === 'info' ? 'bg-white border-l-4 border-blue-500' : ''}
          `}
        >
          <ToastIcon type={toast.type} />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close toast"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
