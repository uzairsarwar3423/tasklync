const getSocketBaseUrl = (): string => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.tasklync.pk/api/v1';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

export const SOCKET_CONFIG = {
  // Use root gateway URL (e.g., https://api.tasklync.pk) for WebSocket handshake
  SOCKET_URL: getSocketBaseUrl(),
  
  // Exponential backoff delays
  RECONNECT_DELAYS_MS: [1000, 2000, 4000, 8000, 16000, 30000],
  
  // Never give up reconnecting silently
  MAX_RECONNECT_ATTEMPTS: Infinity,
  
  // How long a disconnect must last before UI reacts
  BANNER_SHOW_THRESHOLD_MS: 3000,
  
  // Detect zombie connections
  HEARTBEAT_INTERVAL_MS: 25000,
};
