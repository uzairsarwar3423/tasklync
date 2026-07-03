import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../store/location.store';
import { Coordinates } from '../types';

export const useLocation = () => {
  const { permissionStatus, setPermissionStatus, currentLocation, setCurrentLocation, currentCity, setCurrentCity } = useLocationStore();
  const [isLocating, setIsLocating] = useState(false);

  const getCurrentPosition = async () => {
    setIsLocating(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000,
      });

      const coords: Coordinates = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setCurrentLocation(coords);
      await reverseGeocode(coords.lat, coords.lng);
    } catch (error) {
      console.log('Error getting location', error);
      if (!currentCity) {
        setCurrentCity('Your area');
      }
    } finally {
      setIsLocating(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        let name = 'Your area';
        
        if (place.city) {
          name = place.subregion && place.subregion !== place.city 
            ? `${place.subregion}, ${place.city}`
            : place.city;
        } else if (place.region) {
          name = place.region;
        }
        
        setCurrentCity(name);
      } else {
        setCurrentCity('Your area');
      }
    } catch (error) {
      console.log('Error reverse geocoding', error);
      if (!currentCity) {
        setCurrentCity('Your area');
      }
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
    if (permissionStatus === 'granted' && !currentLocation) {
      getCurrentPosition();
    }
  }, [permissionStatus]);

  return {
    location: currentLocation,
    cityName: currentCity || 'Locating...',
    permissionStatus,
    isLocating,
    requestLocation,
    refreshLocation: getCurrentPosition,
  };
};
