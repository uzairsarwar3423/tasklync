export interface UserPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  preferred_language: 'en' | 'ur' | 'ar';
  preferred_currency: 'PKR' | 'USD';
}

export interface UserAddress {
  id: string;
  label: string;
  address_line: string;
  city?: string;
  country?: string;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  preferred_language?: 'en' | 'ur' | 'ar';
  preferred_currency?: 'PKR' | 'USD';
}

export interface UpdatePreferencesPayload {
  push_enabled?: boolean;
  email_enabled?: boolean;
  preferred_language?: 'en' | 'ur' | 'ar';
  preferred_currency?: 'PKR' | 'USD';
}

export interface CreateAddressPayload {
  label: string;
  address_line: string;
  city?: string;
  country?: string;
  lat: number;
  lng: number;
  is_default?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;
