import axios from 'axios';
import { useAuthStore } from '../../store/auth.store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.tasklync.pk/api/v1';

const generateRequestId = (): string => {
  return 'req-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
};

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Public GET routes that should never require auth (browsing/discovery)
const PUBLIC_READ_PREFIXES = ['/search', '/categories', '/services', '/workers/nearby'];

const isPublicReadRoute = (url?: string, method?: string): boolean => {
  if (!url || method?.toLowerCase() !== 'get') return false;
  return PUBLIC_READ_PREFIXES.some((prefix) => url.includes(prefix));
};

// Request interceptor: Auth token & x-request-id trace header
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  // For public browsing routes, skip Authorization to avoid 401 from expired tokens
  if (token && config.headers && !isPublicReadRoute(config.url, config.method)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.headers && !config.headers['x-request-id']) {
    config.headers['x-request-id'] = generateRequestId();
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Token refresh, public route fallback & error normalization
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      // 1. Try automatic token refresh if a refresh token is present
      if (refreshToken && !originalRequest.url?.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const refreshResponse = await axios.post(
            `${API_URL}/auth/token/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const newAccessToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;
          const newRefreshToken = refreshResponse.data?.data?.refreshToken || refreshResponse.data?.refreshToken || refreshToken;

          if (newAccessToken) {
            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
        } finally {
          isRefreshing = false;
        }
      }

      // 2. Token refresh failed or no refresh token: Logout expired session
      useAuthStore.getState().logout();

      // 3. For public GET routes (e.g., search, categories, workers), retry without Authorization header
      const isPublicReadRoute =
        originalRequest.method?.toLowerCase() === 'get' &&
        (originalRequest.url?.includes('/search') ||
          originalRequest.url?.includes('/categories') ||
          originalRequest.url?.includes('/services') ||
          originalRequest.url?.includes('/workers'));

      if (isPublicReadRoute && originalRequest.headers) {
        delete originalRequest.headers.Authorization;
        return apiClient(originalRequest);
      }
    }

    // Normalize backend API error structure
    const apiError = error.response?.data?.error || {
      code: error.response?.data?.code || error.response?.data?.status || 'SERVER_ERROR',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
    };

    return Promise.reject(apiError);
  }
);
