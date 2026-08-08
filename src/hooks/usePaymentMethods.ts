import { useState, useEffect, useCallback } from 'react';
import { paymentApi, SavedPaymentMethod } from '../services/api/payment.api';

export function usePaymentMethods() {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const data = await paymentApi.getSavedMethods();
      setMethods(data);
    } catch (_err) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  return {
    methods,
    isLoading,
    isError,
    refetch: fetchMethods,
  };
}
