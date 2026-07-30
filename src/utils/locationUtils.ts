/**
 * Utility functions for geographic coordinates and distance calculations.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate the distance in meters between two geographic coordinates using the Haversine formula.
 */
export function getDistanceMeters(
  coords1: Coordinates,
  coords2: Coordinates
): number {
  const R = 6371e3; // Earth radius in meters
  const radLat1 = (coords1.lat * Math.PI) / 180;
  const radLat2 = (coords2.lat * Math.PI) / 180;
  const deltaLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
  const deltaLng = ((coords2.lng - coords1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Dynamic location address parser to extract real city/district/area names
 * from reverse geocoded LocationGeocodedAddress objects without static fallbacks.
 */
export function extractCityOrAreaName(place?: any): string {
  if (!place || typeof place !== 'object') return 'Current Area';

  const district = place.district?.trim();
  const city = place.city?.trim() || place.subregion?.trim();
  const region = place.region?.trim();
  const name = place.name?.trim() || place.street?.trim();

  if (district && city && district !== city) {
    return `${district}, ${city}`;
  }
  if (city) return city;
  if (district) return district;
  if (region) return region;
  if (name) return name;

  return 'Current Area';
}

export function extractFullAddressLine(place?: any): string {
  if (!place || typeof place !== 'object') return 'Current GPS Location';

  const streetNumber = place.streetNumber?.trim();
  const street = place.street?.trim() || place.name?.trim();
  const district = place.district?.trim() || place.subregion?.trim();
  const city = place.city?.trim();

  const streetPart = streetNumber && street ? `${streetNumber} ${street}` : street;
  const parts = [streetPart, district, city].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'Current GPS Location';
}
