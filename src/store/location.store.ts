import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import { Coordinates } from '../types/location.types';
import { getDistanceMeters } from '../utils/locationUtils';
import { userApi } from '../services/api/user.api';
import { useAuthStore } from './auth.store';

const storage = createMMKV();
const SYNC_DISTANCE_THRESHOLD_METERS = 100;

interface LocationStoreState {
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  setPermissionStatus: (status: 'granted' | 'denied' | 'undetermined') => void;
  currentLocation: Coordinates | null;
  setCurrentLocation: (loc: Coordinates | null) => void;
  currentCity: string | null;
  setCurrentCity: (city: string | null) => void;
  lastSyncedLocation: Coordinates | null;
  setLastSyncedLocation: (loc: Coordinates | null) => void;
  syncLocationToBackend: (
    coords: Coordinates,
    addressLine?: string,
    city?: string,
    country?: string
  ) => Promise<void>;
  hydrate: () => void;
}

export const useLocationStore = create<LocationStoreState>((set, get) => ({
  permissionStatus: 'undetermined',
  setPermissionStatus: (status) => {
    storage.set('location_permission_status', status);
    set({ permissionStatus: status });
  },
  currentLocation: null,
  setCurrentLocation: (loc) => {
    if (loc) {
      storage.set('current_location', JSON.stringify(loc));
    } else {
      storage.remove('current_location');
    }
    set({ currentLocation: loc });
  },
  currentCity: null,
  setCurrentCity: (city) => {
    if (city) {
      storage.set('current_city', city);
    } else {
      storage.remove('current_city');
    }
    set({ currentCity: city });
  },
  lastSyncedLocation: null,
  setLastSyncedLocation: (loc) => {
    if (loc) {
      storage.set('last_synced_location', JSON.stringify(loc));
    } else {
      storage.remove('last_synced_location');
    }
    set({ lastSyncedLocation: loc });
  },
  syncLocationToBackend: async (coords, addressLine, city, country) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      // User is unauthenticated; location will sync automatically once user logs in
      return;
    }

    const lastSynced = get().lastSyncedLocation;
    if (lastSynced) {
      const distance = getDistanceMeters(lastSynced, coords);
      if (distance < SYNC_DISTANCE_THRESHOLD_METERS) {
        // Less than 100m movement; skip database write to conserve bandwidth & DB writes
        return;
      }
    }

    try {
      await userApi.syncCurrentLocation({
        label: 'Current Location',
        address_line: addressLine || 'GPS Coordinates',
        city: city || get().currentCity || 'Lahore',
        country: country || 'Pakistan',
        lat: coords.lat,
        lng: coords.lng,
        is_default: true,
      });

      storage.set('last_synced_location', JSON.stringify(coords));
      set({ lastSyncedLocation: coords });
    } catch (error) {
      console.warn('[LocationStore] Failed to persist location to user-service DB:', error);
    }
  },
  hydrate: () => {
    const permissionStatus = storage.getString('location_permission_status') as
      | 'granted'
      | 'denied'
      | 'undetermined'
      | undefined;
    const currentCity = storage.getString('current_city');
    const locationStr = storage.getString('current_location');
    const lastSyncedStr = storage.getString('last_synced_location');

    let currentLocation: Coordinates | null = null;
    if (locationStr) {
      try {
        currentLocation = JSON.parse(locationStr);
      } catch (e) {}
    }

    let lastSyncedLocation: Coordinates | null = null;
    if (lastSyncedStr) {
      try {
        lastSyncedLocation = JSON.parse(lastSyncedStr);
      } catch (e) {}
    }

    set({
      permissionStatus: permissionStatus || 'undetermined',
      currentCity: currentCity || null,
      currentLocation,
      lastSyncedLocation,
    });
  },
}));
