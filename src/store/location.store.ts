import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import { Coordinates } from '../types/location.types';
import { PlacePrediction } from '../types/address.types';
import { getDistanceMeters } from '../utils/locationUtils';
import { userApi } from '../services/api/user.api';
import { useAuthStore } from './auth.store';

const storage = createMMKV();
const SYNC_DISTANCE_THRESHOLD_METERS = 100;
const MAX_RECENT_SEARCHES = 5;

interface LocationStoreState {
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  setPermissionStatus: (status: 'granted' | 'denied' | 'undetermined') => void;
  currentLocation: Coordinates | null;
  setCurrentLocation: (loc: Coordinates | null) => void;
  currentCity: string | null;
  setCurrentCity: (city: string | null) => void;
  lastSyncedLocation: Coordinates | null;
  setLastSyncedLocation: (loc: Coordinates | null) => void;
  lastPickedCoords: Coordinates | null;
  setLastPickedCoords: (coords: Coordinates | null) => void;
  recentSearches: PlacePrediction[];
  addRecentSearch: (search: PlacePrediction) => void;
  clearRecentSearches: () => void;
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
  lastPickedCoords: null,
  setLastPickedCoords: (coords) => {
    if (coords) {
      storage.set('last_picked_coords', JSON.stringify(coords));
    } else {
      storage.remove('last_picked_coords');
    }
    set({ lastPickedCoords: coords });
  },
  recentSearches: [],
  addRecentSearch: (search) => {
    const current = get().recentSearches;
    const filtered = current.filter((item) => item.place_id !== search.place_id);
    const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    try {
      storage.set('recent_searches', JSON.stringify(updated));
    } catch (_e) {}
    set({ recentSearches: updated });
  },
  clearRecentSearches: () => {
    try {
      storage.remove('recent_searches');
    } catch (_e) {}
    set({ recentSearches: [] });
  },
  syncLocationToBackend: async (coords, addressLine, city, country) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      return;
    }

    const lastSynced = get().lastSyncedLocation;
    if (lastSynced) {
      const distance = getDistanceMeters(lastSynced, coords);
      if (distance < SYNC_DISTANCE_THRESHOLD_METERS) {
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
    const lastPickedStr = storage.getString('last_picked_coords');
    const recentSearchesStr = storage.getString('recent_searches');

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

    let lastPickedCoords: Coordinates | null = null;
    if (lastPickedStr) {
      try {
        lastPickedCoords = JSON.parse(lastPickedStr);
      } catch (e) {}
    }

    let recentSearches: PlacePrediction[] = [];
    if (recentSearchesStr) {
      try {
        recentSearches = JSON.parse(recentSearchesStr);
      } catch (e) {}
    }

    set({
      permissionStatus: permissionStatus || 'undetermined',
      currentCity: currentCity || null,
      currentLocation,
      lastSyncedLocation,
      lastPickedCoords,
      recentSearches,
    });
  },
}));
