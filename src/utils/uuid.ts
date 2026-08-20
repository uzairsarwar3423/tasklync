/**
 * Standard RFC4122 UUID v4 regex pattern.
 * Validates 8-4-4-4-12 hex characters.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates whether a given string is a valid RFC4122 UUID.
 */
export function isValidUUID(id?: string | null): id is string {
  if (!id || typeof id !== 'string') return false;
  return UUID_REGEX.test(id.trim());
}

/**
 * Generates a standard RFC4122 v4 compliant UUID.
 * Uses native crypto.randomUUID if available, with a fast fallback.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (_e) {
      // Fallback
    }
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Canonical default fallback UUIDs for demo / guest / offline mode.
 */
export const CANONICAL_FALLBACK_UUIDS = {
  ADDRESS_HOME: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  ADDRESS_OFFICE: '8d0f7780-8536-41ef-a55c-f18fd2fa1bf8',
  ADDRESS_PARENTS: '9e1a8891-9647-42f0-b66d-029fe3ab2cf9',
  WORKER_DEFAULT: 'c6a42586-083b-41c8-abf2-df406a802416',
  SERVICE_DEFAULT: '2fb0f7f7-2113-4d4c-ba60-1f3bf8c09114',
} as const;
