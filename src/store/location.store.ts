import { create } from 'zustand';
import { Coordinates } from '../types/location.types';

interface LocationStoreState {
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  setPermissionStatus: (status: 'granted' | 'denied' | 'undetermined') => void;
  currentLocation: Coordinates | null;
  setCurrentLocation: (loc: Coordinates | null) => void;
  currentCity: string | null;
  setCurrentCity: (city: string | null) => void;
}

export const useLocationStore = create<LocationStoreState>((set) => ({
  permissionStatus: 'undetermined',
  setPermissionStatus: (status) => set({ permissionStatus: status }),
  currentLocation: null,
  setCurrentLocation: (loc) => set({ currentLocation: loc }),
  currentCity: null,
  setCurrentCity: (city) => set({ currentCity: city }),
}));
