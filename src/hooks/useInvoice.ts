import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/api/booking.api';
import { InvoiceData } from '../types/booking.types';

/**
 * useInvoice Hook
 *
 * Implements immutable query fetching for post-booking financial receipts/invoices.
 * - Discriminated union return (kind: 'structured' | 'pdf')
 * - StaleTime set to Infinity because settled booking invoices are immutable records
 */
export function useInvoice(bookingId?: string | null) {
  const query = useQuery<InvoiceData, Error>({
    queryKey: ['booking', bookingId, 'invoice'],
    queryFn: async () => {
      if (!bookingId) {
        throw new Error('Booking ID is required to fetch invoice');
      }
      return await bookingApi.getInvoice(bookingId);
    },
    enabled: Boolean(bookingId),
    staleTime: Infinity, // Settled financial document is immutable
  });

  return {
    invoice: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}
