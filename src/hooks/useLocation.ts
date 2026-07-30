import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { useLocationStore } from '../store/location.store';
import { Coordinates } from '../types';
import { extractCityOrAreaName, extractFullAddressLine } from '../utils/locationUtils';

export const useLocation = () => {
  const { 
    permissionStatus, 
    setPermissionStatus, 
    currentLocation, 
    setCurrentLocation, 
    currentCity, 
    setCurrentCity 
  } = useLocationStore();
  
  const [isLocating, setIsLocating] = useState(false);

  const getCurrentPosition = async () => {
    setIsLocating(true);
    try {
      // 1. Try to get last known location first (near-instant)
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        const coords: Coordinates = {
          lat: lastKnown.coords.latitude,
          lng: lastKnown.coords.longitude,
        };
        setCurrentLocation(coords);
        // Run reverse geocoding in background without awaiting, to keep it fast
        reverseGeocode(coords);
      }

      // 2. Fetch fresh position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coordinates = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setCurrentLocation(coords);
      await reverseGeocode(coords);
    } catch (error) {
      console.log('Error getting location', error);
      if (!currentCity) {
        setCurrentCity('Your area');
      }
    } finally {
      setIsLocating(false);
    }
  };

  const reverseGeocode = async (coords: Coordinates) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng });
      const place = geocode && geocode.length > 0 ? geocode[0] : undefined;

      const cityName = extractCityOrAreaName(place);
      const addressLine = extractFullAddressLine(place);
      const countryName = place?.country || 'Pakistan';

      setCurrentCity(cityName);

      // Enterprise Scalable Persistence: Sync coordinates & reverse geocoded address to user-service DB
      useLocationStore.getState().syncLocationToBackend(coords, addressLine, cityName, countryName);
    } catch (error) {
      console.log('Error reverse geocoding', error);
      const fallbackCity = currentCity || 'Current Area';
      if (!currentCity) {
        setCurrentCity(fallbackCity);
      }
      useLocationStore.getState().syncLocationToBackend(coords, 'Current GPS Location', fallbackCity, 'Pakistan');
    }
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    
    if (status === 'granted') {
      await getCurrentPosition();
    }
  };

  useEffect(() => {
    const checkPermissionAndLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setPermissionStatus(status);
        
        if (status === 'granted') {
          await getCurrentPosition();
        } else {
          if (!currentCity) {
            setCurrentCity('Your area');
          }
        }
      } catch (error) {
        console.log('Error checking location permission', error);
        if (!currentCity) {
          setCurrentCity('Your area');
        }
      }
    };

    // Check permission and fetch location immediately on mount
    checkPermissionAndLocation();

    // Subscribe to AppState changes (refetch when returning from settings/background)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermissionAndLocation();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    location: currentLocation,
    cityName: currentCity || (isLocating ? 'Locating...' : 'Your area'),
    permissionStatus,
    isLocating,
    requestLocation,
    refreshLocation: getCurrentPosition,
  };
};
