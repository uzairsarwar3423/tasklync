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

// Request interceptor: Attach Bearer token & x-request-id trace header reliably
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const authState = useAuthStore.getState().authState;

  if (token && config.headers) {
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  if (config.headers) {
    const requestId = generateRequestId();
    if (typeof config.headers.set === 'function' && !config.headers.has('x-request-id')) {
      config.headers.set('x-request-id', requestId);
    } else if (!config.headers['x-request-id']) {
      (config.headers as Record<string, string>)['x-request-id'] = requestId;
    }
  }

  // Non-sensitive request logging for authentication diagnostics
  if (__DEV__) {
    const hasAuth = Boolean(token);
    const authSummary = hasAuth ? `Bearer [TOKEN_PRESENT: len=${token?.length}]` : '[NO_TOKEN]';
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} | AuthState: ${authState} | Authorization: ${authSummary}`);
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

// Response interceptor: Token refresh & error normalization
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (__DEV__) {
        console.warn(`[API Auth Error] 401 Unauthorized on ${originalRequest.url}. Attempting token refresh...`);
      }

      // 1. Try automatic token refresh if a refresh token is present
      if (refreshToken && !originalRequest.url?.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (typeof originalRequest.headers.set === 'function') {
                originalRequest.headers.set('Authorization', `Bearer ${token}`);
              } else {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
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
          const newRefreshToken =
            refreshResponse.data?.data?.refreshToken || refreshResponse.data?.refreshToken || refreshToken;

          if (newAccessToken) {
            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
            processQueue(null, newAccessToken);
            if (typeof originalRequest.headers.set === 'function') {
              originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
            } else {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
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
    }

    // Normalize backend API error structure
    const apiError = error.response?.data?.error || {
      code: error.response?.data?.code || error.response?.data?.status || 'SERVER_ERROR',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
    };

    return Promise.reject(apiError);
  }
);
