export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoLocation extends Coordinates {
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}



export interface NearbyWorkersParams {
  lat: number;
  lng: number;
  radius: number;
  category?: string;
  serviceId?: string;
  minRating?: number;
  maxRate?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
}
