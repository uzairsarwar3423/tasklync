export const SOCKET_CONFIG = {
  // Use a fallback URL if env is not defined
  SOCKET_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Exponential backoff delays
  RECONNECT_DELAYS_MS: [1000, 2000, 4000, 8000, 16000, 30000],
  
  // Never give up reconnecting silently
  MAX_RECONNECT_ATTEMPTS: Infinity,
  
  // How long a disconnect must last before UI reacts
  BANNER_SHOW_THRESHOLD_MS: 3000,
  
  // Detect zombie connections
  HEARTBEAT_INTERVAL_MS: 25000,
};
