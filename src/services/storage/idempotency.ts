import { generateUUID } from '../../utils/uuid';
import { QueuedMutationType } from '../../types/network.types';

/**
 * Generates a unique client-side idempotency key at the moment of the user action
 * Format: idemp_<mutation_type>_<timestamp>_<uuid_suffix>
 * 
 * Critical Day 39 Requirement:
 * Generated at the moment of the original user action (not at queue flush time),
 * ensuring the key travels with the request through retries or offline queuing
 * to prevent duplicate server actions (e.g. duplicate bookings or payments).
 */
export function generateIdempotencyKey(
  mutationType: QueuedMutationType | string,
  customIdentifier?: string
): string {
  const sanitizedType = mutationType
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  
  const timestamp = Date.now();
  const suffix = customIdentifier 
    ? customIdentifier.replace(/[^a-z0-9_-]/gi, '')
    : generateUUID().replace(/-/g, '').slice(0, 12);

  return `idemp_${sanitizedType}_${timestamp}_${suffix}`;
}

/**
 * Validates whether a given string is a valid idempotency key format
 */
export function isValidIdempotencyKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  return /^idemp_[a-z0-9_]+_\d+_[a-zA-Z0-9_-]+$/.test(key.trim());
}

/**
 * Extracts the timestamp encoded inside an idempotency key
 */
export function getIdempotencyTimestamp(key: string): number | null {
  if (!isValidIdempotencyKey(key)) return null;
  const parts = key.split('_');
  if (parts.length >= 3) {
    const ts = parseInt(parts[parts.length - 2], 10);
    return isNaN(ts) ? null : ts;
  }
  return null;
}
