import { useState, useCallback } from 'react';
import { useCartStore } from '../store/cart.store';
import { useBookingDraftStore } from '../store/bookingDraft.store';
import { useLocationStore } from '../store/location.store';
import { bookingApi } from '../services/api/booking.api';
import { BookingDetails, CreateBookingPayload } from '../types/booking.types';

export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cartItems = useCartStore((s) => s.items);
  const cartWorker = useCartStore((s) => s.worker);
  const currentLocation = useLocationStore((s) => s.currentLocation);

  const {
    selectedDate,
    selectedTimeSlot,
    isUrgent,
    workerId: draftWorkerId,
    addressId,
    address,
    note,
  } = useBookingDraftStore();

  const submit = useCallback(async (): Promise<BookingDetails | null> => {
    const serviceIds = cartItems.map((i) => i.serviceId);
    const workerId = draftWorkerId || cartWorker?.id;

    if (serviceIds.length === 0 && !cartWorker) {
      setError('Your cart is empty. Please select services first.');
      return null;
    }

    if (!workerId) {
      setError('Please select a service worker.');
      return null;
    }

    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select a date and time slot for your booking.');
      return null;
    }

    const addrId = addressId || address?.id || 'addr-default-uuid-1';
    const addrText = address
      ? `${address.street}${address.city ? ', ' + address.city : ''}`
      : 'House 12, Street 4, Sector F-8/2, Islamabad';

    const lat = address?.latitude || currentLocation?.lat || 33.7182;
    const lng = address?.longitude || currentLocation?.lng || 73.0605;

    // Convert date + time slot to standard ISO 8601 UTC timestamp
    const dateStr = selectedDate;
    const timePart = selectedTimeSlot ? selectedTimeSlot.split(' ')[0] : '10:00';
    const scheduledAt = new Date(`${dateStr}T${timePart}:00.000Z`).toISOString();

    const payload: CreateBookingPayload = {
      worker_id: workerId,
      category_id: cartWorker?.category || 'electrician',
      service_id: serviceIds[0],
      service_type: 'ONE_TIME',
      scheduled_at: scheduledAt,
      duration_hours: 2,
      address_id: addrId,
      address_text: addrText,
      latitude: lat,
      longitude: lng,
      is_urgent: isUrgent,
      description: note || undefined,
    };

    setIsLoading(true);
    setError(null);

    try {
      const booking = await bookingApi.createBooking(payload);
      setIsLoading(false);
      return booking;
    } catch (err: any) {
      const msg = err?.message || 'Failed to create booking. Please try again.';
      setError(msg);
      setIsLoading(false);
      return null;
    }
  }, [
    cartItems,
    cartWorker,
    draftWorkerId,
    selectedDate,
    selectedTimeSlot,
    isUrgent,
    addressId,
    address,
    note,
    currentLocation,
  ]);

  return {
    submit,
    isLoading,
    error,
  };
}
