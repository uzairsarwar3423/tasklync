/**
 * Address & Map Data Types (Day 36 Specification)
 */

export type AddressLabelType = 'Home' | 'Office' | 'Other';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface Address {
  id: string;
  label: string; // 'Home' | 'Office' | 'Other' or custom label
  custom_label?: string | undefined;
  address_line: string;
  city?: string | undefined;
  country?: string | undefined;
  lat: number;
  lng: number;
  notes?: string | undefined;
  is_default: boolean;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export interface CreateAddressDTO {
  label: string;
  custom_label?: string | undefined;
  address_line: string;
  city?: string | undefined;
  country?: string | undefined;
  lat: number;
  lng: number;
  notes?: string | undefined;
  is_default?: boolean | undefined;
}

export type UpdateAddressDTO = Partial<CreateAddressDTO>;

export interface PlacePrediction {
  place_id: string;
  description: string;
  primary_text: string;
  secondary_text: string;
}

export interface PlaceDetails {
  place_id: string;
  description: string;
  formatted_address: string;
  lat: number;
  lng: number;
  city?: string | undefined;
  country?: string | undefined;
}

export interface ReverseGeocodeResult {
  formatted_address: string;
  address_line: string;
  city?: string | undefined;
  country?: string | undefined;
  lat: number;
  lng: number;
}
