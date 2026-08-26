import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../store/location.store';
import { Coordinates } from '../types/location.types';
import { localStorage } from '../services/storage/local.storage';

export function useCurrentLocation() {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const permissionStatus = useLocationStore((s) => s.permissionStatus);
  const setPermissionStatus = useLocationStore((s) => s.setPermissionStatus);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const setCurrentLocation = useLocationStore((s) => s.setCurrentLocation);

  // Initialize from cached last known location if memory state is empty (Section 3.2)
  useEffect(() => {
    if (!currentLocation) {
      const cached = localStorage.getCachedLastLocation();
      if (cached) {
        setCurrentLocation({ lat: cached.latitude, lng: cached.longitude });
      }
    }
  }, [currentLocation, setCurrentLocation]);

  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
      } else if (status === 'denied') {
        setPermissionStatus('denied');
      } else {
        setPermissionStatus('undetermined');
      }
      return status;
    } catch (_e) {
      return 'undetermined';
    }
  }, [setPermissionStatus]);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
        return true;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch (_e) {
      setPermissionStatus('denied');
      return false;
    }
  }, [setPermissionStatus]);

  const fetchLocation = useCallback(async (): Promise<Coordinates | null> => {
    setIsFetching(true);
    setError(null);

    try {
      let currentPerm = permissionStatus;
      if (currentPerm !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setError('Location permission was denied');
          setIsFetching(false);
          // Fall back to cached location if available
          const cached = localStorage.getCachedLastLocation();
          return cached ? { lat: cached.latitude, lng: cached.longitude } : null;
        }
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setCurrentLocation(coords);
      localStorage.cacheLastLocation({
        latitude: coords.lat,
        longitude: coords.lng,
      });
      return coords;
    } catch (err: any) {
      setError(err?.message || 'Failed to obtain current GPS location');
      const cached = localStorage.getCachedLastLocation();
      return cached ? { lat: cached.latitude, lng: cached.longitude } : null;
    } finally {
      setIsFetching(false);
    }
  }, [permissionStatus, requestPermission, setCurrentLocation]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    currentLocation,
    permissionStatus,
    isPermissionGranted: permissionStatus === 'granted',
    isPermissionDenied: permissionStatus === 'denied',
    isFetching,
    error,
    fetchLocation,
    requestPermission,
    checkPermission,
  };
}
