import { useCallback } from 'react';
import { useCartStore } from '../store/cart.store';

export interface IncomingCartItem {
  serviceId: string;
  serviceName: string;
  price: number;
  workerId: string;
  workerName?: string;
  workerAvatar?: string | null;
  workerRating?: number;
  workerCategory?: string;
}

export const useCartValidation = () => {
  const currentWorker = useCartStore((state) => state.worker);
  const items = useCartStore((state) => state.items);

  const checkWorkerConflict = useCallback(
    (targetWorkerId: string): boolean => {
      if (!currentWorker || items.length === 0) return false;
      return currentWorker.id !== targetWorkerId;
    },
    [currentWorker, items]
  );

  return {
    currentWorker,
    hasItems: items.length > 0,
    checkWorkerConflict,
  };
};
