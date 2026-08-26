import { NETWORK_CONFIG } from '../config/networkConfig';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

/**
 * Calculates exponential backoff delay with optional jitter
 * Formula: Math.min(initialDelay * (factor ^ (attempt - 1)), maxDelay)
 */
export function calculateBackoffDelay(
  attempt: number,
  initialDelayMs: number = NETWORK_CONFIG.INITIAL_RETRY_DELAY_MS,
  maxDelayMs: number = NETWORK_CONFIG.MAX_RETRY_DELAY_MS,
  factor: number = NETWORK_CONFIG.BACKOFF_FACTOR,
  jitter: boolean = true
): number {
  if (attempt <= 0) return 0;
  
  const exponentialDelay = initialDelayMs * Math.pow(factor, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);

  if (!jitter) {
    return cappedDelay;
  }

  // Full jitter: distributes retry spikes smoothly across 75% - 125% of target delay
  const jitterMultiplier = 0.75 + Math.random() * 0.5;
  return Math.round(cappedDelay * jitterMultiplier);
}

/**
 * Helper to pause execution for a given duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines whether an error is a transient network error eligible for retry
 * (Non-network 4xx client validation errors MUST NEVER be queued for blind retry)
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  // Axios network error or timeout
  if (error.isAxiosError) {
    if (!error.response) {
      // No response received (network failure, DNS failure, timeout, offline)
      return true;
    }
    const status = error.response.status;
    // 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout, 408 Request Timeout
    if (status === 408 || status === 502 || status === 503 || status === 504) {
      return true;
    }
    // 4xx validation or client errors should NOT be retried
    return false;
  }

  // Standard fetch TypeError (e.g. "Network request failed")
  if (error instanceof TypeError && error.message.toLowerCase().includes('network')) {
    return true;
  }

  // Message check fallback
  const msg = String(error.message || error).toLowerCase();
  if (
    msg.includes('network') ||
    msg.includes('offline') ||
    msg.includes('timeout') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('connection')
  ) {
    return true;
  }

  return false;
}

/**
 * Executes an async task with exponential backoff retries
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = NETWORK_CONFIG.MAX_RETRY_ATTEMPTS,
    initialDelayMs = NETWORK_CONFIG.INITIAL_RETRY_DELAY_MS,
    maxDelayMs = NETWORK_CONFIG.MAX_RETRY_DELAY_MS,
    factor = NETWORK_CONFIG.BACKOFF_FACTOR,
    jitter = true,
    shouldRetry = (err) => isNetworkError(err),
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt >= maxAttempts || !shouldRetry(error, attempt)) {
        throw error;
      }

      const delay = calculateBackoffDelay(attempt, initialDelayMs, maxDelayMs, factor, jitter);
      onRetry?.(attempt, delay, error);
      await sleep(delay);
    }
  }

  throw lastError;
}
