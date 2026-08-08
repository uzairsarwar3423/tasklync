import { useState, useCallback } from 'react';
import { paymentApi } from '../services/api/payment.api';

export function usePayment() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(
    async (amount: number, methodId: string): Promise<boolean> => {
      if (amount <= 0) {
        setError('Invalid payment amount.');
        return false;
      }
      if (!methodId) {
        setError('Please select a payment method.');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 1. Create PaymentIntent on server
        const intent = await paymentApi.createPaymentIntent(amount);

        // 2. Confirm Payment via Stripe / Backend
        const confirmation = await paymentApi.confirmPayment(intent.paymentIntentId, methodId);

        setIsLoading(false);
        if (confirmation.success) {
          return true;
        } else {
          setError('Payment transaction was declined.');
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
