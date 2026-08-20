/**
 * Booking Service Customer API Types & Specification Interfaces
 * Aligned with BOOKING_SERVICE_CUSTOMER_API_SPECIFICATION.md (v2.0.0)
 */

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED_BY_WORKER'
  | 'COMPLETED'
  | 'AUTO_COMPLETED'
  | 'DISPUTED'
  | 'RESOLVED'
  | 'REFUNDED'
  | 'CANCELLED';

export type ServiceType = 'ONE_TIME' | 'RECURRING';

export type PriceType = 'hourly' | 'fixed';

export type DisputeStatus = 'OPEN' | 'WORKER_RESPONDED' | 'RESOLVED' | 'REFUNDED' | 'REJECTED';

/**
 * 6.1 Price Estimate Query Parameters (GET /api/v1/bookings/estimate)
 */
export interface PriceEstimateParams {
  worker_id: string;
  category_id: string;
  service_id?: string | undefined;
  scheduled_at: string; // ISO-8601 UTC
  duration_hours: number; // 0.5 to 12.0
  latitude: number;
  longitude: number;
  is_urgent: boolean;
  custom_base_price?: number | undefined;
}

/**
 * 6.1 Price Estimate Response Data
 */
export interface PriceEstimateData {
  base_price: number;
  urgency_multiplier: number;
  demand_multiplier: number;
  time_of_day_multiplier: number;
  estimated_total: number;
  platform_fee: number;
  worker_commission?: number | undefined;
  worker_amount: number;
  platform_revenue?: number | undefined;
  currency: string;
  price_type: PriceType;
}

/**
 * 6.2 Create Booking Request Payload (POST /api/v1/bookings)
 */
export interface CreateBookingPayload {
  worker_id: string;
  category_id: string;
  service_id?: string | undefined;
  service_type: ServiceType;
  scheduled_at: string; // ISO-8601 UTC
  duration_hours: number;
  address_id: string;
  address_text: string;
  latitude: number;
  longitude: number;
  is_urgent: boolean;
  description?: string | undefined;
  custom_base_price?: number | undefined;
}

/**
 * 6.2 & 6.4 Booking Details Model
 */
export interface BookingDetails {
  id: string;
  user_id: string;
  worker_id: string;
  category_id: string;
  service_id?: string | undefined;
  service_type: ServiceType;
  status: BookingStatus;
  scheduled_at: string;
  duration_hours: number;
  expires_at?: string | undefined;
  address_id: string;
  address_text: string;
  job_site_location: {
    lat: number;
    lng: number;
  };
  base_price: number;
  urgency_multiplier: number;
  demand_multiplier: number;
  time_of_day_multiplier: number;
  estimated_total: number;
  platform_fee: number;
  worker_amount: number;
  currency: string;
  price_type: PriceType;
  is_urgent: boolean;
  is_payment_confirmed: boolean;
  cancellation_reason?: string | undefined;
  cancelled_by?: string | undefined;
  completed_at?: string | undefined;
  started_at?: string | undefined;
  description?: string | undefined;
  created_at: string;
  worker_name?: string | undefined;
  worker_avatar_url?: string | undefined;
  worker_phone?: string | undefined;
  category_name?: string | undefined;
}

/**
 * 6.3 List Customer Bookings Query Parameters (GET /api/v1/bookings)
 */
export interface ListBookingsParams {
  page?: number | undefined;
  limit?: number | undefined;
  status?: BookingStatus | string | undefined;
  from_date?: string | undefined;
  to_date?: string | undefined;
}

/**
 * Booking Pagination Metadata
 */
export interface BookingPaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages?: number | undefined;
  totalPages?: number | undefined;
  has_next?: boolean | undefined;
  has_prev?: boolean | undefined;
  hasMore?: boolean | undefined;
}

/**
 * 6.3 List Response Envelope
 */
export interface ListBookingsResponse {
  status: 'success' | 'error';
  data: BookingDetails[];
  meta: BookingPaginationMeta;
  message?: string | undefined;
}

/**
 * 6.5 Real-time Booking Tracking Data (GET /api/v1/bookings/:id/track)
 */
export interface BookingTrackData {
  booking_id: string;
  status: BookingStatus;
  scheduled_at: string;
  started_at: string | null;
  worker_id: string;
  worker_name?: string | undefined;
  worker_phone?: string | undefined;
  worker_latitude?: number | undefined;
  worker_longitude?: number | undefined;
}

/**
 * 6.6 Cancel Booking Payload & Response (PATCH /api/v1/bookings/:id/cancel)
 */
export interface CancelBookingPayload {
  reason: string;
}

export interface CancelBookingData {
  id: string;
  status: 'CANCELLED';
  cancellation_reason: string;
  cancelled_by: 'user' | 'worker';
  updated_at: string;
}

/**
 * 6.7 Confirm Booking Completion Response (PATCH /api/v1/bookings/:id/confirm)
 */
export interface ConfirmCompletionData {
  id: string;
  status: 'COMPLETED';
  completed_at: string;
}

/**
 * 6.8 Open Dispute Payload & Response (POST /api/v1/bookings/:id/dispute)
 */
export interface OpenDisputePayload {
  reason: string;
  evidence_urls?: string[] | undefined;
}

export interface DisputeDetails {
  id: string;
  booking_id: string;
  raised_by: string;
  raised_against: string;
  status: DisputeStatus;
  reason: string;
  evidence_urls?: string[] | undefined;
  worker_response?: string | undefined;
  created_at: string;
}

/**
 * Standard Gateway API Envelope Structure
 */
export interface ApiEnvelope<T> {
  status: 'success' | 'error';
  data: T;
  message?: string | undefined;
  code?: string | undefined;
  meta?: BookingPaginationMeta | undefined;
}
