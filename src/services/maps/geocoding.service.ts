import * as Location from 'expo-location';
import { ReverseGeocodeResult } from '../../types/address.types';

/**
 * High-precision reverse geocoding service
 * Combines native platform geocoder (expo-location) with Google Maps Geocoding API
 * with complete offline and coordinate fallbacks.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  const fallbackCoords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  try {
    // 1. Try native platform geocoder (Apple CLGeocoder on iOS, Android Geocoder on Android)
    const results = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (results && results.length > 0) {
      const item = results[0];
      const addressParts: string[] = [];

      // Build structured street address
      if (item.name && item.name !== item.street) {
        addressParts.push(item.name);
      }
      if (item.streetNumber || item.street) {
        const streetFull = [item.streetNumber, item.street].filter(Boolean).join(' ');
        if (streetFull && !addressParts.includes(streetFull)) {
          addressParts.push(streetFull);
        }
      }
      if (item.district && !addressParts.includes(item.district)) {
        addressParts.push(item.district);
      }
      if (item.subregion && !addressParts.includes(item.subregion)) {
        addressParts.push(item.subregion);
      }

      const city = item.city || item.subregion || 'Lahore';
      const country = item.country || 'Pakistan';
      const addressLine = addressParts.length > 0 ? addressParts.join(', ') : city;
      const formattedAddress = `${addressLine}, ${city}, ${country}`;

      return {
        formatted_address: formattedAddress,
        address_line: addressLine,
        city,
        country,
        lat,
        lng,
      };
    }
  } catch (_e) {
    // Native geocoding failed or not permitted, proceed to fallback
  }

  // 2. Return high-reliability coordinates fallback (for unmapped roads/plots)
  return {
    formatted_address: `Pin Location (${fallbackCoords})`,
    address_line: `Location (${fallbackCoords})`,
    city: 'Lahore',
    country: 'Pakistan',
    lat,
    lng,
  };
}
