import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '../store/cart.store';
import { useBookingDraftStore } from '../store/bookingDraft.store';
import { useLocationStore } from '../store/location.store';
import { bookingApi } from '../services/api/booking.api';
import { PriceEstimateData } from '../types/booking.types';

export function useBookingEstimate() {
  const cartItems = useCartStore((s) => s.items);
  const cartWorker = useCartStore((s) => s.worker);

  const selectedDate = useBookingDraftStore((s) => s.selectedDate);
  const selectedTimeSlot = useBookingDraftStore((s) => s.selectedTimeSlot);
  const isUrgent = useBookingDraftStore((s) => s.isUrgent);
  const address = useBookingDraftStore((s) => s.address);
  const workerId = useBookingDraftStore((s) => s.workerId) || cartWorker?.id || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  const currentLocation = useLocationStore((s) => s.currentLocation);

  const [estimate, setEstimate] = useState<PriceEstimateData>({
    base_price: 3000,
    urgency_multiplier: 1.0,
    demand_multiplier: 1.0,
    time_of_day_multiplier: 1.0,
    estimated_total: 3000,
    platform_fee: 450,
    worker_amount: 2550,
    currency: 'PKR',
    price_type: 'hourly',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchEstimate = useCallback(async () => {
    // Construct ISO-8601 UTC scheduled timestamp
    let scheduledAt = new Date().toISOString();
    if (selectedDate) {
      const timePart = selectedTimeSlot ? selectedTimeSlot.split(' ')[0] : '10:00';
      scheduledAt = new Date(`${selectedDate}T${timePart}:00.000Z`).toISOString();
    }

    const firstService = cartItems[0];
    const categoryId = cartWorker?.category || 'electrician';
    const serviceId = firstService?.serviceId;

    const lat = address?.latitude || currentLocation?.lat || 33.7182;
    const lng = address?.longitude || currentLocation?.lng || 73.0605;

    setIsLoading(true);
    try {
      const result = await bookingApi.getPriceEstimate({
        worker_id: workerId,
        category_id: categoryId,
        service_id: serviceId,
        scheduled_at: scheduledAt,
        duration_hours: 2,
        latitude: lat,
        longitude: lng,
        is_urgent: isUrgent,
      });

      setEstimate(result);
    } catch (_e) {
      // Direct local computation fallback
      const cartSubtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
      const basePrice = cartSubtotal > 0 ? cartSubtotal : 3000;
      const urgMult = isUrgent ? 1.5 : 1.0;
      const total = Math.round(basePrice * urgMult);
      const fee = Math.round(total * 0.15);

      setEstimate({
        base_price: basePrice,
        urgency_multiplier: urgMult,
        demand_multiplier: 1.0,
        time_of_day_multiplier: 1.0,
        estimated_total: total,
        platform_fee: fee,
        worker_amount: total - fee,
        currency: 'PKR',
        price_type: 'hourly',
      });
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, cartWorker, workerId, selectedDate, selectedTimeSlot, isUrgent, address, currentLocation]);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  return {
    basePrice: estimate.base_price,
    subtotal: estimate.base_price,
    platformFee: estimate.platform_fee,
    urgentFee: isUrgent ? Math.round(estimate.base_price * 0.5) : 0,
    discount: 0,
    total: estimate.estimated_total,
    workerAmount: estimate.worker_amount,
    currency: estimate.currency,
    estimateData: estimate,
    isLoading,
    refetch: fetchEstimate,
  };
}
