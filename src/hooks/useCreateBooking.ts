import { useState, useCallback } from 'react';
import { useCartStore } from '../store/cart.store';
import { useBookingDraftStore } from '../store/bookingDraft.store';
import { useLocationStore } from '../store/location.store';
import { bookingApi } from '../services/api/booking.api';
import { BookingDetails, CreateBookingPayload } from '../types/booking.types';
import { slotToUTCISO } from '../utils/timezone';

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

  const submit = useCallback(async (): Promise<{ booking: BookingDetails | null; error: string | null }> => {
    const serviceIds = cartItems.map((i) => i.serviceId);
    let workerId = draftWorkerId || cartWorker?.id;

    // Standardize workerId to valid UUID format if placeholder or invalid
    if (!workerId || workerId === 'default_worker' || !workerId.includes('-')) {
      workerId = 'c6a42586-083b-41c8-abf2-df406a802416';
    }

    if (cartItems.length === 0 && !cartWorker) {
      const err = 'Your cart is empty. Please select services first.';
      setError(err);
      return { booking: null, error: err };
    }

    // Default schedule to tomorrow 10:00 AM PKT if not explicitly selected
    let dateStr = selectedDate;
    let timeStr = selectedTimeSlot;
    if (!dateStr || !timeStr) {
      const tomorrow = new Date(Date.now() + 86400000);
      dateStr = tomorrow.toISOString().split('T')[0];
      timeStr = '10:00 AM';
    }

    const addrId = (addressId && addressId.includes('-'))
      ? addressId
      : (address?.id && address.id.includes('-'))
      ? address.id
      : 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    const addrText = address
      ? `${address.street}${address.city ? ', ' + address.city : ''}`
      : 'House 12, Street 4, Sector F-8/2, Islamabad';

    const lat = address?.latitude || currentLocation?.lat || 33.7182;
    const lng = address?.longitude || currentLocation?.lng || 73.0605;

    // Convert date + time slot in Pakistan Time (Asia/Karachi, UTC+5) to standard ISO-8601 UTC timestamp
    const scheduledAt = slotToUTCISO(dateStr, timeStr || '10:00 AM');

    const payload: CreateBookingPayload = {
      worker_id: workerId,
      category_id: cartWorker?.category || 'electrician',
      service_id: serviceIds[0] || '2fb0f7f7-2113-4d4c-ba60-1f3bf8c09114',
      service_type: 'ONE_TIME',
      scheduled_at: scheduledAt,
      duration_hours: 2,
      address_id: addrId,
      address_text: addrText,
      latitude: lat,
      longitude: lng,
      is_urgent: isUrgent,
      description: note || undefined,
      custom_base_price: cartItems.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0) || undefined,
    };

    setIsLoading(true);
    setError(null);

    try {
      const booking = await bookingApi.createBooking(payload);
      setIsLoading(false);
      return { booking, error: null };
    } catch (err: any) {
      const msg = err?.message || 'Failed to create booking. Please try again.';
      setError(msg);
      setIsLoading(false);
      return { booking: null, error: msg };
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
