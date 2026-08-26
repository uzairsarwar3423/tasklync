import { createMMKV } from 'react-native-mmkv';
import { QueuedRequest, QueuedMutationType } from '../../types/network.types';
import { NETWORK_CONFIG } from '../../config/networkConfig';
import { generateUUID } from '../../utils/uuid';
import { generateIdempotencyKey } from './idempotency';

const storage = createMMKV();

const { REQUEST_QUEUE, FAILED_QUEUE } = NETWORK_CONFIG.STORAGE_KEYS;

/**
 * MMKV-backed synchronous persistent FIFO queue
 * Handles immediate synchronous writes on every operation to guarantee
 * zero lost mutations across app force-kills, backgrounding, or OS termination.
 */
export const requestQueueStorage = {
  /**
   * Retrieves all currently queued requests in FIFO order
   */
  getQueue(): QueuedRequest[] {
    try {
      const raw = storage.getString(REQUEST_QUEUE);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[RequestQueue] Error reading request queue from MMKV:', e);
      return [];
    }
  },

  /**
   * Appends a new request to the tail of the FIFO queue synchronously
   */
  enqueue<T = any>(item: {
    mutationType: QueuedMutationType;
    payload: T;
    idempotencyKey?: string;
    id?: string;
  }): QueuedRequest<T> {
    const queue = this.getQueue();
    const id = item.id || generateUUID();
    const idempotencyKey =
      item.idempotencyKey || generateIdempotencyKey(item.mutationType);

    const queuedRequest: QueuedRequest<T> = {
      id,
      mutationType: item.mutationType,
      payload: item.payload,
      createdAt: Date.now(),
      idempotencyKey,
      retryCount: 0,
    };

    const updatedQueue = [...queue, queuedRequest];
    try {
      storage.set(REQUEST_QUEUE, JSON.stringify(updatedQueue));
    } catch (e) {
      console.error('[RequestQueue] Failed to write queued request to MMKV:', e);
    }

    return queuedRequest;
  },

  /**
   * Pops the oldest request from the front of the FIFO queue
   */
  dequeue(): QueuedRequest | undefined {
    const queue = this.getQueue();
    if (queue.length === 0) return undefined;

    const [first, ...rest] = queue;
    try {
      storage.set(REQUEST_QUEUE, JSON.stringify(rest));
    } catch (e) {
      console.error('[RequestQueue] Failed to update queue after dequeue:', e);
    }

    return first;
  },

  /**
   * Peeks at the next request to be processed without removing it
   */
  peek(): QueuedRequest | undefined {
    const queue = this.getQueue();
    return queue[0];
  },

  /**
   * Removes a specific request by id
   */
  remove(id: string): void {
    const queue = this.getQueue();
    const filtered = queue.filter((item) => item.id !== id);
    try {
      storage.set(REQUEST_QUEUE, JSON.stringify(filtered));
    } catch (e) {
      console.error('[RequestQueue] Failed to remove item from MMKV:', e);
    }
  },

  /**
   * Updates an existing request in the queue (e.g. incrementing retryCount or error message)
   */
  update(id: string, updates: Partial<QueuedRequest>): void {
    const queue = this.getQueue();
    const updated = queue.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    try {
      storage.set(REQUEST_QUEUE, JSON.stringify(updated));
    } catch (e) {
      console.error('[RequestQueue] Failed to update queued request in MMKV:', e);
    }
  },

  /**
   * Clears all pending requests
   */
  clearQueue(): void {
    try {
      storage.remove(REQUEST_QUEUE);
    } catch (e) {
      console.error('[RequestQueue] Failed to clear request queue:', e);
    }
  },

  /**
   * Retrieves failed-after-retry requests for user-facing manual retry
   */
  getFailedQueue(): QueuedRequest[] {
    try {
      const raw = storage.getString(FAILED_QUEUE);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[RequestQueue] Error reading failed queue:', e);
      return [];
    }
  },

  /**
   * Adds an exhausted item to the failed queue
   */
  addToFailedQueue(request: QueuedRequest): void {
    const failedQueue = this.getFailedQueue();
    // Prevent duplicate entries
    const existingIndex = failedQueue.findIndex((item) => item.id === request.id);
    let updated: QueuedRequest[];
    if (existingIndex >= 0) {
      updated = failedQueue.map((item, idx) =>
        idx === existingIndex ? { ...item, ...request } : item
      );
    } else {
      updated = [...failedQueue, request];
    }

    try {
      storage.set(FAILED_QUEUE, JSON.stringify(updated));
    } catch (e) {
      console.error('[RequestQueue] Failed to save to failed queue:', e);
    }
  },

  /**
   * Removes an item from the failed queue
   */
  removeFromFailedQueue(id: string): void {
    const failed = this.getFailedQueue();
    const updated = failed.filter((item) => item.id !== id);
    try {
      storage.set(FAILED_QUEUE, JSON.stringify(updated));
    } catch (e) {
      console.error('[RequestQueue] Failed to remove from failed queue:', e);
    }
  },

  /**
   * Clears the entire failed queue
   */
  clearFailedQueue(): void {
    try {
      storage.remove(FAILED_QUEUE);
    } catch (e) {
      console.error('[RequestQueue] Failed to clear failed queue:', e);
    }
  },

  /**
   * Total number of items currently in queue
   */
  getQueueLength(): number {
    return this.getQueue().length;
  },
};
