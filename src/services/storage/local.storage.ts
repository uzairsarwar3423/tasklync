import { createMMKV } from 'react-native-mmkv';
import { NETWORK_CONFIG } from '../../config/networkConfig';

const storage = createMMKV();

const {
  CACHE_BOOKINGS,
  CACHE_WORKER_PROFILES,
  CACHE_LAST_LOCATION,
  CACHE_CATEGORIES,
  CACHE_USER_PROFILE,
} = NETWORK_CONFIG.STORAGE_KEYS;

export interface CacheEnvelope<T> {
  data: T;
  cachedAt: number;
}

export interface CachedLocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  timestamp: number;
}

/**
 * Local MMKV-backed typed cache storage for offline-first instant render.
 * Allows instant cold-start screen hydration before any network requests complete.
 */
export const localStorage = {
  // Raw MMKV instance accessor for specialized sub-stores
  raw: storage,

  // ----------------------------------------------------
  // BOOKINGS CACHE
  // ----------------------------------------------------
  cacheBookings<T = any>(bookings: T): void {
    try {
      const envelope: CacheEnvelope<T> = {
        data: bookings,
        cachedAt: Date.now(),
      };
      storage.set(CACHE_BOOKINGS, JSON.stringify(envelope));
    } catch (e) {
      console.warn('[LocalStorage] Error caching bookings:', e);
    }
  },

  getCachedBookings<T = any>(): CacheEnvelope<T> | null {
    try {
      const raw = storage.getString(CACHE_BOOKINGS);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[LocalStorage] Error reading cached bookings:', e);
      return null;
    }
  },

  clearCachedBookings(): void {
    try {
      storage.remove(CACHE_BOOKINGS);
    } catch (_e) {}
  },

  // ----------------------------------------------------
  // WORKER PROFILES CACHE (Keyed by Worker ID)
  // ----------------------------------------------------
  cacheWorkerProfile<T = any>(workerId: string, profile: T): void {
    try {
      const key = `${CACHE_WORKER_PROFILES}:${workerId}`;
      const envelope: CacheEnvelope<T> = {
        data: profile,
        cachedAt: Date.now(),
      };
      storage.set(key, JSON.stringify(envelope));
    } catch (e) {
      console.warn(`[LocalStorage] Error caching worker profile ${workerId}:`, e);
    }
  },

  getCachedWorkerProfile<T = any>(workerId: string): CacheEnvelope<T> | null {
    try {
      const key = `${CACHE_WORKER_PROFILES}:${workerId}`;
      const raw = storage.getString(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[LocalStorage] Error reading cached worker profile ${workerId}:`, e);
      return null;
    }
  },

  // ----------------------------------------------------
  // LAST KNOWN LOCATION CACHE
  // Prevents cold-start "spinner forever while GPS locks" dead end
  // ----------------------------------------------------
  cacheLastLocation(location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
  }): void {
    try {
      const cachedLocation: CachedLocationData = {
        ...location,
        timestamp: Date.now(),
      };
      storage.set(CACHE_LAST_LOCATION, JSON.stringify(cachedLocation));
    } catch (e) {
      console.warn('[LocalStorage] Error caching last known location:', e);
    }
  },

  getCachedLastLocation(): CachedLocationData | null {
    try {
      const raw = storage.getString(CACHE_LAST_LOCATION);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[LocalStorage] Error reading cached last location:', e);
      return null;
    }
  },

  // ----------------------------------------------------
  // CATEGORIES CACHE
  // ----------------------------------------------------
  cacheCategories<T = any>(categories: T): void {
    try {
      const envelope: CacheEnvelope<T> = {
        data: categories,
        cachedAt: Date.now(),
      };
      storage.set(CACHE_CATEGORIES, JSON.stringify(envelope));
    } catch (e) {
      console.warn('[LocalStorage] Error caching categories:', e);
    }
  },

  getCachedCategories<T = any>(): CacheEnvelope<T> | null {
    try {
      const raw = storage.getString(CACHE_CATEGORIES);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[LocalStorage] Error reading cached categories:', e);
      return null;
    }
  },

  // ----------------------------------------------------
  // USER PROFILE CACHE
  // ----------------------------------------------------
  cacheUserProfile<T = any>(user: T): void {
    try {
      const envelope: CacheEnvelope<T> = {
        data: user,
        cachedAt: Date.now(),
      };
      storage.set(CACHE_USER_PROFILE, JSON.stringify(envelope));
    } catch (e) {
      console.warn('[LocalStorage] Error caching user profile:', e);
    }
  },

  getCachedUserProfile<T = any>(): CacheEnvelope<T> | null {
    try {
      const raw = storage.getString(CACHE_USER_PROFILE);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[LocalStorage] Error reading cached user profile:', e);
      return null;
    }
  },

  // ----------------------------------------------------
  // GENERAL CACHE HELPERS
  // ----------------------------------------------------
  setGeneric<T>(key: string, data: T): void {
    try {
      const envelope: CacheEnvelope<T> = {
        data,
        cachedAt: Date.now(),
      };
      storage.set(key, JSON.stringify(envelope));
    } catch (e) {
      console.warn(`[LocalStorage] Error setting key ${key}:`, e);
    }
  },

  getGeneric<T>(key: string): CacheEnvelope<T> | null {
    try {
      const raw = storage.getString(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  remove(key: string): void {
    try {
      storage.remove(key);
    } catch (_e) {}
  },

  clearAllCaches(): void {
    try {
      storage.remove(CACHE_BOOKINGS);
      storage.remove(CACHE_LAST_LOCATION);
      storage.remove(CACHE_CATEGORIES);
      storage.remove(CACHE_USER_PROFILE);
    } catch (e) {
      console.warn('[LocalStorage] Error clearing caches:', e);
    }
  },
};
