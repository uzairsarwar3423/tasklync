export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasMore?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  status?: 'success' | 'error';
  success?: boolean;
  message?: string;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
  };
  pagination?: PaginationMeta;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items?: T[];
  workers?: T[];
  reviews?: T[];
  pagination: PaginationMeta;
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';
