import { useMemo } from 'react';
import { useCartStore } from '../store/cart.store';

export interface CartTotals {
  subtotal: number;
  platformFee: number;
  total: number;
  itemCount: number;
}

const PLATFORM_FEE_RATE = 0.05; // 5% customer platform fee

export const useCartTotals = (): CartTotals => {
  const items = useCartStore((state) => state.items);

  return useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
    const total = subtotal + platformFee;

    return {
      subtotal,
      platformFee,
      total,
      itemCount,
    };
  }, [items]);
};
