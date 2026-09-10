import { useState, useCallback } from 'react';
import { paymentApi } from '../services/api/payment.api';

export function usePayment() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(
    async (amount: number, methodId: string, bookingId?: string | null): Promise<boolean> => {
      if (amount <= 0) {
        setError('Invalid payment amount.');
        return false;
      }
      if (!methodId) {
        setError('Please select a payment method.');
        return false;
      }
      if (!bookingId || bookingId.startsWith('b-') || bookingId.startsWith('TL-')) {
        setError('No valid booking reference found for payment.');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await paymentApi.initiatePayment({
          booking_id: bookingId,
          payment_method_id: methodId,
          amount,
          currency: 'PKR',
        });

        setIsLoading(false);
        if (res.success) {
          return true;
        } else {
          setError(res.message || 'Payment transaction was declined.');
          return false;
        }
      } catch (err: any) {
        const msg = err?.message || 'Payment failed. Please try again.';
        setError(msg);
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  return {
    processPayment,
    isLoading,
    error,
  };
}
