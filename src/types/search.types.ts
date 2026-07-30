import { WorkerNearby } from './worker.types';

export type SortOption = 'distance' | 'rating' | 'price_low' | 'price_high';

export interface FilterState {
  categories: string[];
  minRating: number;
  minRate: number;
  maxRate: number;
  sortBy: SortOption;
  available: 'any' | 'now' | 'today';
}

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  minRating: 0,
  minRate: 0,
  maxRate: 0,
  sortBy: 'distance',
  available: 'any',
};

export interface SearchParams {
  q: string;
  category?: string | undefined;
  minRating?: number | undefined;
  maxRate?: number | undefined;
  radius?: number | undefined;
  sortBy?: SortOption | undefined;
  available?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  lat?: number | undefined;
  lng?: number | undefined;
}

export interface SearchResult {
  workers: WorkerNearby[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface RecentSearch {
  query: string;
  timestamp: number;
}

export interface SearchSuggestion {
  type: 'worker' | 'service' | 'category';
  id: string;
  label: string;
  subLabel?: string;
  iconUrl?: string;
}
