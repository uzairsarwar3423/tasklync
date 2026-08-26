import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastData } from '../components/feedback/Toast/Toast';
import { generateUUID } from '../utils/uuid';

interface ToastContextValue {
  showToast: (toast: Omit<ToastData, 'id'> & { id?: string }) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (toastInput: Omit<ToastData, 'id'> & { id?: string }): string => {
      const id = toastInput.id || generateUUID();
      const newToast: ToastData = {
        ...toastInput,
        id,
      };

      setToasts((prev) => {
        // Keep at most 2 concurrent toasts on screen
        const existing = prev.filter((t) => t.id !== id);
        return [...existing.slice(-1), newToast];
      });

      return id;
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={hideToast} />
      ))}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
