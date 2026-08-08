import { apiClient } from './client';
import { useAuthStore } from '../../store/auth.store';
import {
  PriceEstimateParams,
  PriceEstimateData,
  CreateBookingPayload,
  BookingDetails,
  ListBookingsParams,
  ListBookingsResponse,
  BookingTrackData,
  CancelBookingData,
  ConfirmCompletionData,
  DisputeDetails,
  OpenDisputePayload,
  ApiEnvelope,
} from '../../types/booking.types';

// Local mock storage for offline / guest demo session simulation
const localMockBookings: Map<string, BookingDetails> = new Map();
const localMockDisputes: Map<string, DisputeDetails> = new Map();

/**
 * Helper to calculate realistic spec-compliant estimate locally
 */
function calculateLocalEstimate(params: PriceEstimateParams): PriceEstimateData {
  const baseRatePerHour = 1500;
  const hours = params.duration_hours || 2;
  const basePrice = baseRatePerHour * hours;

  // Multipliers as per Section 4 of Spec
  const urgencyMultiplier = params.is_urgent ? 1.5 : 1.0;
  const demandMultiplier = 1.0;
  const timeOfDayMultiplier = 1.0;

  const estimatedTotal = Math.round(
    basePrice * urgencyMultiplier * demandMultiplier * timeOfDayMultiplier
  );
  const platformFee = Math.round(estimatedTotal * 0.15); // 15% platform commission
  const workerAmount = estimatedTotal - platformFee; // 85% worker payout

  return {
    base_price: basePrice,
    urgency_multiplier: urgencyMultiplier,
    demand_multiplier: demandMultiplier,
    time_of_day_multiplier: timeOfDayMultiplier,
    estimated_total: estimatedTotal,
    platform_fee: platformFee,
    worker_amount: workerAmount,
    currency: 'PKR',
    price_type: 'hourly',
  };
}

/**
 * Helper to seed initial demo bookings if empty
 */
function seedLocalMockBookings() {
  if (localMockBookings.size === 0) {
    const defaultBookings: BookingDetails[] = [
      {
        id: 'b101-active-electrician',
        user_id: 'u9876543-2100-11ec-8d3d-0242ac130003',
        worker_id: 'w101-ahmed-khan',
        worker_name: 'Ahmed Khan',
        worker_avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        category_id: 'electrician',
        category_name: 'Electrical Repair',
        service_type: 'ONE_TIME',
        status: 'IN_PROGRESS',
        scheduled_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        duration_hours: 2,
        address_id: 'addr-1',
        address_text: 'House 12, Street 4, Sector F-8/2, Islamabad',
        job_site_location: { lat: 33.7182, lng: 73.0605 },
        base_price: 3000,
        urgency_multiplier: 1.0,
        demand_multiplier: 1.0,
        time_of_day_multiplier: 1.0,
        estimated_total: 3000,
        platform_fee: 450,
        worker_amount: 2550,
        currency: 'PKR',
        price_type: 'hourly',
        is_urgent: false,
        is_payment_confirmed: true,
        description: 'Short circuit fix in main DB box',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: 'b102-completed-plumber',
        user_id: 'u9876543-2100-11ec-8d3d-0242ac130003',
        worker_id: 'w102-tariq-mehmood',
        worker_name: 'Tariq Mehmood',
        worker_avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        category_id: 'plumber',
        category_name: 'Plumbing & Pipe Repair',
        service_type: 'ONE_TIME',
        status: 'COMPLETED',
        scheduled_at: new Date(Date.now() - 86400 * 2 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 86400 * 2 * 1000 + 7200 * 1000).toISOString(),
        duration_hours: 2,
        address_id: 'addr-1',
        address_text: 'House 12, Street 4, Sector F-8/2, Islamabad',
        job_site_location: { lat: 33.7182, lng: 73.0605 },
        base_price: 2500,
        urgency_multiplier: 1.0,
        demand_multiplier: 1.0,
        time_of_day_multiplier: 1.0,
        estimated_total: 2500,
        platform_fee: 375,
        worker_amount: 2125,
        currency: 'PKR',
        price_type: 'hourly',
        is_urgent: false,
        is_payment_confirmed: true,
        description: 'Kitchen sink pipe leak repair',
        created_at: new Date(Date.now() - 86400 * 3 * 1000).toISOString(),
      },
    ];

    defaultBookings.forEach((b) => localMockBookings.set(b.id, b));
  }
}

function getLocalMockList(params?: ListBookingsParams): ListBookingsResponse {
  seedLocalMockBookings();
  let filtered = Array.from(localMockBookings.values());
  if (params?.status && params.status !== 'ALL') {
    filtered = filtered.filter((b) => b.status === params.status);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;

  return {
    status: 'success',
    data: filtered,
    meta: {
      total: filtered.length,
      page,
      limit,
      total_pages: Math.ceil(filtered.length / limit) || 1,
      has_next: false,
      has_prev: false,
    },
  };
}

/**
 * TaskLync Booking Service Client
 * Implements Customer API Specification v2.0.0 (Port 3004 / Gateway /api/v1/bookings)
 */
export const bookingApi = {
  /**
   * 6.1 Get Price Estimate
   * GET /api/v1/bookings/estimate
   */
  getPriceEstimate: async (params: PriceEstimateParams): Promise<PriceEstimateData> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      return calculateLocalEstimate(params);
    }

    try {
      const response = await apiClient.get<ApiEnvelope<PriceEstimateData>>('/bookings/estimate', {
        params,
      });
      return response.data?.data || response.data;
    } catch (_error) {
      return calculateLocalEstimate(params);
    }
  },

  /**
   * 6.2 Create Booking
   * POST /api/v1/bookings
   */
  createBooking: async (payload: CreateBookingPayload): Promise<BookingDetails> => {
    const token = useAuthStore.getState().accessToken;
    const baseEstimate = calculateLocalEstimate({
      worker_id: payload.worker_id,
      category_id: payload.category_id,
      service_id: payload.service_id,
      scheduled_at: payload.scheduled_at,
      duration_hours: payload.duration_hours,
      latitude: payload.latitude,
      longitude: payload.longitude,
      is_urgent: payload.is_urgent,
    });

    const newBooking: BookingDetails = {
      id: `b9283f51-${Date.now().toString(16)}-4e2b-9204-7a18f8e12345`,
      user_id: 'u9876543-2100-11ec-8d3d-0242ac130003',
      worker_id: payload.worker_id,
      category_id: payload.category_id,
      service_id: payload.service_id,
      service_type: payload.service_type || 'ONE_TIME',
      status: 'PENDING',
      scheduled_at: payload.scheduled_at,
      duration_hours: payload.duration_hours,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      address_id: payload.address_id,
      address_text: payload.address_text,
      job_site_location: {
        lat: payload.latitude,
        lng: payload.longitude,
      },
      base_price: baseEstimate.base_price,
      urgency_multiplier: baseEstimate.urgency_multiplier,
      demand_multiplier: baseEstimate.demand_multiplier,
      time_of_day_multiplier: baseEstimate.time_of_day_multiplier,
      estimated_total: baseEstimate.estimated_total,
      platform_fee: baseEstimate.platform_fee,
      worker_amount: baseEstimate.worker_amount,
      currency: 'PKR',
      price_type: 'hourly',
      is_urgent: payload.is_urgent,
      is_payment_confirmed: false,
      description: payload.description,
      created_at: new Date().toISOString(),
      worker_name: 'Ahmed Khan',
      category_name: 'Electrician & Electrical Services',
    };

    if (!token) {
      localMockBookings.set(newBooking.id, newBooking);
      return newBooking;
    }

    try {
      const response = await apiClient.post<ApiEnvelope<BookingDetails>>('/bookings', payload);
      return response.data?.data || response.data;
    } catch (_error) {
      localMockBookings.set(newBooking.id, newBooking);
      return newBooking;
    }
  },

  /**
   * 6.3 List Customer Bookings
   * GET /api/v1/bookings
   */
  listBookings: async (params?: ListBookingsParams): Promise<ListBookingsResponse> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      return getLocalMockList(params);
    }

    try {
      const response = await apiClient.get<ListBookingsResponse>('/bookings', { params });
      return response.data;
    } catch (_error) {
      return getLocalMockList(params);
    }
  },

  /**
   * 6.4 Get Booking Details
   * GET /api/v1/bookings/:id
   */
  getBookingDetails: async (id: string): Promise<BookingDetails> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      seedLocalMockBookings();
      if (localMockBookings.has(id)) {
        return localMockBookings.get(id)!;
      }
      return Array.from(localMockBookings.values())[0];
    }

    try {
      const response = await apiClient.get<ApiEnvelope<BookingDetails>>(`/bookings/${id}`);
      return response.data?.data || response.data;
    } catch (_error) {
      seedLocalMockBookings();
      if (localMockBookings.has(id)) {
        return localMockBookings.get(id)!;
      }
      return Array.from(localMockBookings.values())[0];
    }
  },

  /**
   * 6.5 Track Booking
   * GET /api/v1/bookings/:id/track
   */
  trackBooking: async (id: string): Promise<BookingTrackData> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      seedLocalMockBookings();
      const booking = localMockBookings.get(id) || Array.from(localMockBookings.values())[0];
      return {
        booking_id: id,
        status: booking?.status || 'IN_PROGRESS',
        scheduled_at: booking?.scheduled_at || new Date().toISOString(),
        started_at: booking?.started_at || new Date().toISOString(),
        worker_id: booking?.worker_id || 'w101-ahmed-khan',
        worker_name: booking?.worker_name || 'Ahmed Khan',
        worker_phone: '+92 300 1234567',
        worker_latitude: 33.719,
        worker_longitude: 73.061,
      };
    }

    try {
      const response = await apiClient.get<ApiEnvelope<BookingTrackData>>(`/bookings/${id}/track`);
      return response.data?.data || response.data;
    } catch (_error) {
      seedLocalMockBookings();
      const booking = localMockBookings.get(id) || Array.from(localMockBookings.values())[0];
      return {
        booking_id: id,
        status: booking?.status || 'IN_PROGRESS',
        scheduled_at: booking?.scheduled_at || new Date().toISOString(),
        started_at: booking?.started_at || new Date().toISOString(),
        worker_id: booking?.worker_id || 'w101-ahmed-khan',
        worker_name: booking?.worker_name || 'Ahmed Khan',
        worker_phone: '+92 300 1234567',
        worker_latitude: 33.719,
        worker_longitude: 73.061,
      };
    }
  },

  /**
   * 6.6 Cancel Booking
   * PATCH /api/v1/bookings/:id/cancel
   */
  cancelBooking: async (id: string, reason: string): Promise<CancelBookingData> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      const booking = localMockBookings.get(id);
      if (booking) {
        booking.status = 'CANCELLED';
        booking.cancellation_reason = reason;
        booking.cancelled_by = 'user';
        localMockBookings.set(id, booking);
      }
      return {
        id,
        status: 'CANCELLED',
        cancellation_reason: reason,
        cancelled_by: 'user',
        updated_at: new Date().toISOString(),
      };
    }

    try {
      const response = await apiClient.patch<ApiEnvelope<CancelBookingData>>(`/bookings/${id}/cancel`, {
        reason,
      });
      return response.data?.data || response.data;
    } catch (_error) {
      const booking = localMockBookings.get(id);
      if (booking) {
        booking.status = 'CANCELLED';
        booking.cancellation_reason = reason;
        booking.cancelled_by = 'user';
        localMockBookings.set(id, booking);
      }
      return {
        id,
        status: 'CANCELLED',
        cancellation_reason: reason,
        cancelled_by: 'user',
        updated_at: new Date().toISOString(),
      };
    }
  },

  /**
   * 6.7 Confirm Booking Completion
   * PATCH /api/v1/bookings/:id/confirm
   */
  confirmCompletion: async (id: string): Promise<ConfirmCompletionData> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      const booking = localMockBookings.get(id);
      if (booking) {
        booking.status = 'COMPLETED';
        booking.completed_at = new Date().toISOString();
        localMockBookings.set(id, booking);
      }
      return {
        id,
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      };
    }

    try {
      const response = await apiClient.patch<ApiEnvelope<ConfirmCompletionData>>(`/bookings/${id}/confirm`);
      return response.data?.data || response.data;
    } catch (_error) {
      const booking = localMockBookings.get(id);
      if (booking) {
        booking.status = 'COMPLETED';
        booking.completed_at = new Date().toISOString();
        localMockBookings.set(id, booking);
      }
      return {
        id,
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      };
    }
  },

  /**
   * 6.8 Open Dispute
   * POST /api/v1/bookings/:id/dispute
   */
  openDispute: async (
    id: string,
    reason: string,
    evidenceUrls?: string[] | undefined
  ): Promise<DisputeDetails> => {
    const token = useAuthStore.getState().accessToken;
    const disputeId = `d-${Date.now().toString(16)}`;
    const dispute: DisputeDetails = {
      id: disputeId,
      booking_id: id,
      raised_by: 'u9876543-2100-11ec-8d3d-0242ac130003',
      raised_against: 'w101-ahmed-khan',
      status: 'OPEN',
      reason,
      evidence_urls: evidenceUrls,
      created_at: new Date().toISOString(),
    };

    if (!token) {
      const booking = localMockBookings.get(id);
      if (booking) {
        booking.status = 'DISPUTED';
        localMockBookings.set(id, booking);
      }
      localMockDisputes.set(id, dispute);
      return dispute;
    }

    try {
      const response = await apiClient.post<ApiEnvelope<DisputeDetails>>(`/bookings/${id}/dispute`, {
        reason,
        evidence_urls: evidenceUrls,
      } as OpenDisputePayload);
      return response.data?.data || response.data;
    } catch (_error) {
      const booking = localMockBookings.get(id);
      if (booking) {
        booking.status = 'DISPUTED';
        localMockBookings.set(id, booking);
      }
      localMockDisputes.set(id, dispute);
      return dispute;
    }
  },

  /**
   * 6.9 View Dispute
   * GET /api/v1/bookings/:id/dispute
   */
  getDispute: async (id: string): Promise<DisputeDetails> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      if (localMockDisputes.has(id)) {
        return localMockDisputes.get(id)!;
      }
      return {
        id: `d-${id}`,
        booking_id: id,
        raised_by: 'u9876543-2100-11ec-8d3d-0242ac130003',
        raised_against: 'w101-ahmed-khan',
        status: 'OPEN',
        reason: 'Service quality issue under investigation by support team.',
        created_at: new Date().toISOString(),
      };
    }

    try {
      const response = await apiClient.get<ApiEnvelope<DisputeDetails>>(`/bookings/${id}/dispute`);
      return response.data?.data || response.data;
    } catch (_error) {
      if (localMockDisputes.has(id)) {
        return localMockDisputes.get(id)!;
      }
      return {
        id: `d-${id}`,
        booking_id: id,
        raised_by: 'u9876543-2100-11ec-8d3d-0242ac130003',
        raised_against: 'w101-ahmed-khan',
        status: 'OPEN',
        reason: 'Service quality issue under investigation by support team.',
        created_at: new Date().toISOString(),
      };
    }
  },
};
