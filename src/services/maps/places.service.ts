import * as Location from 'expo-location';
import { PlacePrediction, PlaceDetails } from '../../types/address.types';
import { generateUUID } from '../../utils/uuid';

// Popular landmarks cache for fast local instant matching & offline reliability
const POPULAR_PAKISTAN_PLACES: Array<{
  id: string;
  name: string;
  secondary: string;
  lat: number;
  lng: number;
  city: string;
}> = [
  {
    id: 'lhr_pkg_mall',
    name: 'Packages Mall',
    secondary: 'Walton Road, Gulxher Town, Lahore',
    lat: 31.4727,
    lng: 74.3562,
    city: 'Lahore',
  },
  {
    id: 'lhr_emp_mall',
    name: 'Emporium Mall',
    secondary: 'Abdul Haque Rd, Trade Centre Commercial Area Phase 2 Johar Town, Lahore',
    lat: 31.4676,
    lng: 74.266,
    city: 'Lahore',
  },
  {
    id: 'lhr_dha_phase6',
    name: 'DHA Phase 6 Main Commercial',
    secondary: 'Sector CCA, Phase 6 DHA, Lahore',
    lat: 31.464,
    lng: 74.4552,
    city: 'Lahore',
  },
  {
    id: 'lhr_gulberg_mm',
    name: 'M.M. Alam Road',
    secondary: 'Gulberg III, Lahore, Punjab',
    lat: 31.5134,
    lng: 74.3524,
    city: 'Lahore',
  },
  {
    id: 'lhr_liberty_mkt',
    name: 'Liberty Market',
    secondary: 'Noor Jehan Rd, Commercial Area Gulberg III, Lahore',
    lat: 31.5103,
    lng: 74.3441,
    city: 'Lahore',
  },
  {
    id: 'lhr_model_town',
    name: 'Model Town Central Commercial',
    secondary: 'Model Town, Lahore, Punjab',
    lat: 31.4883,
    lng: 74.3186,
    city: 'Lahore',
  },
  {
    id: 'isb_centaurus',
    name: 'The Centaurus Mall',
    secondary: 'Jinnah Avenue, Sector F-8/4, Islamabad',
    lat: 33.7077,
    lng: 73.0501,
    city: 'Islamabad',
  },
  {
    id: 'isb_blue_area',
    name: 'Blue Area Commercial Hub',
    secondary: 'Jinnah Ave, Blue Area, Islamabad',
    lat: 33.712,
    lng: 73.0645,
    city: 'Islamabad',
  },
  {
    id: 'khi_clifton',
    name: 'Dolmen Mall Clifton',
    secondary: 'Marine Drive, Block 4 Clifton, Karachi',
    lat: 24.8138,
    lng: 67.0305,
    city: 'Karachi',
  },
  {
    id: 'khi_dha_phase5',
    name: 'Khayaban-e-Shahbaz Commercial',
    secondary: 'Phase 5 DHA, Karachi, Sindh',
    lat: 24.7969,
    lng: 67.0543,
    city: 'Karachi',
  },
];

/**
 * Generates a standard UUID session token for Google Places Autocomplete billing optimization
 */
export function generatePlacesSessionToken(): string {
  return generateUUID();
}

/**
 * Places Autocomplete query
 */
export async function autocompletePlaces(
  query: string,
  sessionToken?: string
): Promise<PlacePrediction[]> {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  const apiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.GOOGLE_MAPS_KEY ||
    '';

  // If live Google API Key is valid and configured
  if (apiKey && apiKey !== 'your_key_here') {
    // 1. Try Places API (New) - required for modern Google Cloud projects
    try {
      const newPlacesRes = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify({
          input: cleanQuery,
          includedRegionCodes: ['PK'],
        }),
      });
      const newPlacesJson = await newPlacesRes.json();
      if (Array.isArray(newPlacesJson.suggestions) && newPlacesJson.suggestions.length > 0) {
        return newPlacesJson.suggestions.slice(0, 5).map((s: any) => {
          const placePred = s.placePrediction;
          return {
            place_id: placePred.placeId,
            description: placePred.text?.text || '',
            primary_text: placePred.structuredFormat?.mainText?.text || placePred.text?.text || '',
            secondary_text: placePred.structuredFormat?.secondaryText?.text || '',
          };
        });
      }
    } catch (_e) {
      // Fall through to legacy
    }

    // 2. Try Places API (Legacy)
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        cleanQuery
      )}&components=country:pk&sessiontoken=${sessionToken || generatePlacesSessionToken()}&key=${apiKey}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.status === 'OK' && Array.isArray(json.predictions)) {
        return json.predictions.slice(0, 5).map((p: any) => ({
          place_id: p.place_id,
          description: p.description,
          primary_text: p.structured_formatting?.main_text || p.description,
          secondary_text: p.structured_formatting?.secondary_text || '',
        }));
      }
    } catch (_e) {
      // Fallback to native or curated
    }
  }

  // Local matching against curated and forward-geocoded places
  const lower = cleanQuery.toLowerCase();
  const matchedCurated = POPULAR_PAKISTAN_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.secondary.toLowerCase().includes(lower) ||
      p.city.toLowerCase().includes(lower)
  ).slice(0, 5);

  if (matchedCurated.length > 0) {
    return matchedCurated.map((p) => ({
      place_id: p.id,
      description: `${p.name}, ${p.secondary}`,
      primary_text: p.name,
      secondary_text: p.secondary,
    }));
  }

  // Forward geocode with expo-location fallback
  try {
    const geoResults = await Location.geocodeAsync(cleanQuery);
    if (geoResults && geoResults.length > 0) {
      const topResults = geoResults.slice(0, 3);
      return topResults.map((r, index) => ({
        place_id: `geo_${r.latitude}_${r.longitude}_${index}`,
        description: cleanQuery,
        primary_text: cleanQuery,
        secondary_text: `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`,
      }));
    }
  } catch (_e) {}

  return [];
}

/**
 * Fetch Place Details by place_id
 */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails | null> {
  const apiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.GOOGLE_MAPS_KEY ||
    '';

  // Check curated dataset
  const curated = POPULAR_PAKISTAN_PLACES.find((p) => p.id === placeId);
  if (curated) {
    return {
      place_id: curated.id,
      description: `${curated.name}, ${curated.secondary}`,
      formatted_address: `${curated.name}, ${curated.secondary}`,
      lat: curated.lat,
      lng: curated.lng,
      city: curated.city,
      country: 'Pakistan',
    };
  }

  // Check geocoded ID pattern
  if (placeId.startsWith('geo_')) {
    const parts = placeId.split('_');
    const lat = parseFloat(parts[1]);
    const lng = parseFloat(parts[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return {
        place_id: placeId,
        description: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        formatted_address: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat,
        lng,
        city: 'Lahore',
        country: 'Pakistan',
      };
    }
  }

  // Live Google Places Details API
  if (apiKey && apiKey !== 'your_key_here') {
    // 1. Try Places API (New) details
    try {
      const newDetailsRes = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=id,displayName,formattedAddress,location,addressComponents`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
        }
      );
      const newJson = await newDetailsRes.json();
      if (newJson.location && typeof newJson.location.latitude === 'number') {
        let city = 'Lahore';
        let country = 'Pakistan';
        for (const comp of newJson.addressComponents || []) {
          if (comp.types?.includes('locality')) city = comp.longText || comp.shortText;
          if (comp.types?.includes('country')) country = comp.longText || comp.shortText;
        }
        return {
          place_id: placeId,
          description: newJson.displayName?.text || newJson.formattedAddress || '',
          formatted_address: newJson.formattedAddress || newJson.displayName?.text || '',
          lat: newJson.location.latitude,
          lng: newJson.location.longitude,
          city,
          country,
        };
      }
    } catch (_e) {}

    // 2. Try Legacy Place Details
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&fields=formatted_address,geometry,address_components,name&sessiontoken=${
        sessionToken || ''
      }&key=${apiKey}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.status === 'OK' && json.result) {
        const result = json.result;
        const lat = result.geometry?.location?.lat || 31.5204;
        const lng = result.geometry?.location?.lng || 74.3587;
        const cityComp = result.address_components?.find((c: any) =>
          c.types.includes('locality')
        );

        return {
          place_id: placeId,
          description: result.name || result.formatted_address,
          formatted_address: result.formatted_address,
          lat,
          lng,
          city: cityComp?.long_name || 'Lahore',
          country: 'Pakistan',
        };
      }
    } catch (_e) {}
  }

  return null;
}
