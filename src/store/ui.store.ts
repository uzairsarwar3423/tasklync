import { create } from 'zustand';

interface ToastOptions {
  type: 'success' | 'error' | 'info';
  title: string;
}

interface UIStoreState {
  showToast: (options: ToastOptions) => void;
}

export const useUIStore = create<UIStoreState>(() => ({
  showToast: (options) => {
    // In a real app, this would trigger a toast component. For Day 3, we mock it via console or generic implementation.
    console.log(`[Toast ${options.type.toUpperCase()}]: ${options.title}`);
  },
}));
