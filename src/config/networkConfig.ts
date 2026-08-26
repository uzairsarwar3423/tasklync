import { QueuedMutationType } from '../types/network.types';

export const NETWORK_CONFIG = {
  // Connectivity debouncing (prevents UI flicker on 1s blips / elevator / subway handoff)
  DEBOUNCE_MS: 500,

  // Offline queue TTL: 5 minutes expiry. Expired items dropped silently on flush
  QUEUE_TTL_MS: 5 * 60 * 1000,

  // Retry backoff parameters for flush retries
  MAX_RETRY_ATTEMPTS: 3,
  INITIAL_RETRY_DELAY_MS: 1000,
  MAX_RETRY_DELAY_MS: 10000,
  BACKOFF_FACTOR: 2,

  // Microinteraction durations (Section 8)
  BANNER_ANIM_DURATION_MS: 200,
  SYNC_INDICATOR_FADE_MS: 150,
  SYNC_INDICATOR_HOLD_MS: 1500,
  MESSAGE_STATUS_FADE_MS: 100,
  TOAST_ANIM_DURATION_MS: 250,

  // Stale data badge tick interval (Section 3.3)
  STALE_BADGE_TICK_INTERVAL_MS: 30000,

  // UI Dimensions (Section 11)
  BANNER_HEIGHT: 36,
  SYNC_PILL_HEIGHT: 28,
  STALE_BADGE_HEIGHT: 20,
  MESSAGE_STATUS_ICON_SIZE: 12,

  // Pre-approved mutations eligible for offline queuing (Section 5.1)
  // Booking creation & payment confirmation are handled with strict network-only retry checks
  APPROVED_QUEUE_MUTATIONS: [
    'CREATE_BOOKING',
    'CANCEL_BOOKING',
    'UPDATE_CART',
    'SEND_CHAT_MESSAGE',
    'SUBMIT_REVIEW',
    'MARK_NOTIFICATION_READ',
  ] as QueuedMutationType[],

  // Storage keys for MMKV persistence
  STORAGE_KEYS: {
    REQUEST_QUEUE: 'tasklync:request_queue',
    FAILED_QUEUE: 'tasklync:failed_queue',
    CACHE_BOOKINGS: 'cache:bookings',
    CACHE_WORKER_PROFILES: 'cache:workerProfiles',
    CACHE_LAST_LOCATION: 'cache:lastLocation',
    CACHE_CATEGORIES: 'cache:categories',
    CACHE_USER_PROFILE: 'cache:userProfile',
    PERSISTED_QUERY_CACHE: 'tasklync:query_cache',
  },

  // Per-query cache policies (Section 3.1)
  CACHE_TIMES: {
    CATEGORIES: {
      staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
    },
    WORKER_PROFILES: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
    NEARBY_WORKERS: {
      staleTime: 30 * 1000, // 30 seconds (matches backend server cache)
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    BOOKING_HISTORY: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
    ACTIVE_BOOKINGS: {
      staleTime: 0, // Always stale (live status must never show stale data)
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    REVIEWS: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
    USER_PROFILE: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 60 * 60 * 1000, // 1 hour
    },
  },
} as const;
