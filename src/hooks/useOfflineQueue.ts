import { useState, useEffect, useRef, useCallback } from 'react';
import { QueuedRequest, QueuedMutationType, SyncState } from '../types/network.types';
import { NETWORK_CONFIG } from '../config/networkConfig';
import { requestQueueStorage } from '../services/storage/requestQueue.storage';
import { generateIdempotencyKey } from '../services/storage/idempotency';
import { withRetry, isNetworkError } from '../utils/retryBackoff';
import { apiClient } from '../services/api/client';
import { queryClient } from '../config/queryClient';

export type MutationExecutor = (request: QueuedRequest) => Promise<any>;

const defaultExecutors: Record<string, MutationExecutor> = {
  CREATE_BOOKING: async (req) => {
    return apiClient.post('/bookings', req.payload, {
      headers: { 'Idempotency-Key': req.idempotencyKey },
    });
  },
  CANCEL_BOOKING: async (req) => {
    const bookingId = req.payload?.bookingId || req.payload?.id;
    return apiClient.post(`/bookings/${bookingId}/cancel`, req.payload, {
      headers: { 'Idempotency-Key': req.idempotencyKey },
    });
  },
  UPDATE_CART: async (req) => {
    return apiClient.put('/cart', req.payload, {
      headers: { 'Idempotency-Key': req.idempotencyKey },
    });
  },
  SEND_CHAT_MESSAGE: async (req) => {
    const conversationId = req.payload?.conversationId;
    return apiClient.post(`/chat/conversations/${conversationId}/messages`, req.payload, {
      headers: { 'Idempotency-Key': req.idempotencyKey },
    });
  },
  SUBMIT_REVIEW: async (req) => {
    return apiClient.post('/reviews', req.payload, {
      headers: { 'Idempotency-Key': req.idempotencyKey },
    });
  },
  MARK_NOTIFICATION_READ: async (req) => {
    const notificationId = req.payload?.notificationId || req.payload?.id;
    return apiClient.put(`/notifications/${notificationId}/read`, req.payload, {
      headers: { 'Idempotency-Key': req.idempotencyKey },
    });
  },
};

export interface UseOfflineQueueResult {
  queue: QueuedRequest[];
  failedQueue: QueuedRequest[];
  isSyncing: boolean;
  syncState: SyncState;
  enqueue: <T = any>(
    mutationType: QueuedMutationType,
    payload: T,
    idempotencyKey?: string
  ) => QueuedRequest<T>;
  flush: () => Promise<{ succeeded: number; failed: number; dropped: number }>;
  retryFailedItem: (id: string) => Promise<boolean>;
  retryAllFailed: () => Promise<void>;
  clearFailed: () => void;
  removeQueuedItem: (id: string) => void;
}

/**
 * Custom hook managing the offline mutation queue lifecycle.
 * Implements strict FIFO sequential processing, 5-minute TTL dropping,
 * action-time idempotency tracking, and backoff retries.
 */
export function useOfflineQueue(
  onFailedItemsExhausted?: (failedItems: QueuedRequest[]) => void
): UseOfflineQueueResult {
  const [queue, setQueue] = useState<QueuedRequest[]>(() =>
    requestQueueStorage.getQueue()
  );
  const [failedQueue, setFailedQueue] = useState<QueuedRequest[]>(() =>
    requestQueueStorage.getFailedQueue()
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    pendingCount: 0,
    totalToSync: 0,
    failedCount: 0,
    lastSyncedAt: null,
  });

  const isFlushingRef = useRef<boolean>(false);
  const onFailedRef = useRef(onFailedItemsExhausted);
  onFailedRef.current = onFailedItemsExhausted;

  const refreshState = useCallback(() => {
    const currentQueue = requestQueueStorage.getQueue();
    const currentFailed = requestQueueStorage.getFailedQueue();
    setQueue(currentQueue);
    setFailedQueue(currentFailed);
    setSyncState((prev) => ({
      ...prev,
      pendingCount: currentQueue.length,
      failedCount: currentFailed.length,
    }));
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  /**
   * Enqueues an approved mutation synchronously to MMKV
   */
  const enqueue = useCallback(
    <T = any>(
      mutationType: QueuedMutationType,
      payload: T,
      idempotencyKey?: string
    ): QueuedRequest<T> => {
      const finalKey =
        idempotencyKey || generateIdempotencyKey(mutationType);

      const request = requestQueueStorage.enqueue({
        mutationType,
        payload,
        idempotencyKey: finalKey,
      });

      refreshState();
      return request;
    },
    [refreshState]
  );

  /**
   * Removes a queued item
   */
  const removeQueuedItem = useCallback(
    (id: string) => {
      requestQueueStorage.remove(id);
      refreshState();
    },
    [refreshState]
  );

  /**
   * Executes a single queued request via executor or fallback
   */
  const executeRequest = async (request: QueuedRequest): Promise<any> => {
    const executor = defaultExecutors[request.mutationType];
    if (executor) {
      return executor(request);
    }
    // Generic fallback for custom endpoints
    const endpoint = `/${request.mutationType.toLowerCase().replace(/_/g, '-')}`;
    return apiClient.post(endpoint, request.payload, {
      headers: { 'Idempotency-Key': request.idempotencyKey },
    });
  };

  /**
   * Invalidates relevant React Query caches post-mutation
   */
  const invalidateAssociatedCaches = (mutationType: string) => {
    switch (mutationType) {
      case 'CREATE_BOOKING':
      case 'CANCEL_BOOKING':
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['active_bookings'] });
        break;
      case 'UPDATE_CART':
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        break;
      case 'SEND_CHAT_MESSAGE':
        queryClient.invalidateQueries({ queryKey: ['chat'] });
        break;
      case 'SUBMIT_REVIEW':
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['workers'] });
        break;
      case 'MARK_NOTIFICATION_READ':
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        break;
      default:
        break;
    }
  };

  /**
   * Flushes the entire offline queue in strict FIFO order
   */
  const flush = useCallback(async (): Promise<{
    succeeded: number;
    failed: number;
    dropped: number;
  }> => {
    // Flush lock: prevent concurrent execution
    if (isFlushingRef.current) {
      return { succeeded: 0, failed: 0, dropped: 0 };
    }

    const currentQueue = requestQueueStorage.getQueue();
    if (currentQueue.length === 0) {
      return { succeeded: 0, failed: 0, dropped: 0 };
    }

    isFlushingRef.current = true;
    setIsSyncing(true);
    setSyncState({
      isSyncing: true,
      pendingCount: currentQueue.length,
      totalToSync: currentQueue.length,
      failedCount: requestQueueStorage.getFailedQueue().length,
      lastSyncedAt: null,
    });

    let succeeded = 0;
    let failed = 0;
    let dropped = 0;
    const newlyFailed: QueuedRequest[] = [];
    const now = Date.now();

    try {
      // Process items in strict FIFO sequential order (Section 5.3)
      for (const item of currentQueue) {
        // 1. Check TTL Expiry (5 minutes)
        const isExpired = now - item.createdAt > NETWORK_CONFIG.QUEUE_TTL_MS;
        if (isExpired) {
          console.log(
            `[OfflineQueue] Dropping stale request id=${item.id} (${item.mutationType}), age=${Math.round(
              (now - item.createdAt) / 1000
            )}s`
          );
          requestQueueStorage.remove(item.id);
          dropped++;
          setSyncState((prev) => ({
            ...prev,
            pendingCount: Math.max(0, prev.pendingCount - 1),
          }));
          continue;
        }

        // 2. Attempt Execution with Backoff Retry
        try {
          await withRetry(() => executeRequest(item), {
            maxAttempts: NETWORK_CONFIG.MAX_RETRY_ATTEMPTS,
            initialDelayMs: NETWORK_CONFIG.INITIAL_RETRY_DELAY_MS,
            maxDelayMs: NETWORK_CONFIG.MAX_RETRY_DELAY_MS,
            factor: NETWORK_CONFIG.BACKOFF_FACTOR,
            jitter: true,
            shouldRetry: (err) => isNetworkError(err),
          });

          // Successfully completed
          requestQueueStorage.remove(item.id);
          invalidateAssociatedCaches(item.mutationType);
          succeeded++;
        } catch (error: any) {
          console.warn(
            `[OfflineQueue] Request failed after retries for id=${item.id}:`,
            error
          );

          // Move to failedQueue for manual user-facing retry (Section 5.4)
          requestQueueStorage.remove(item.id);
          const failedItem: QueuedRequest = {
            ...item,
            error: error?.message || 'Sync failed due to network error',
            lastAttemptAt: Date.now(),
          };
          requestQueueStorage.addToFailedQueue(failedItem);
          newlyFailed.push(failedItem);
          failed++;
        }

        setSyncState((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
        }));
      }
    } finally {
      isFlushingRef.current = false;
      setIsSyncing(false);
      refreshState();
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: Date.now(),
      }));

      // Trigger user toast callback if any items exhausted retries
      if (newlyFailed.length > 0) {
        onFailedRef.current?.(newlyFailed);
      }
    }

    return { succeeded, failed, dropped };
  }, [refreshState]);

  /**
   * Manually retries a specific failed item
   */
  const retryFailedItem = useCallback(
    async (id: string): Promise<boolean> => {
      const failedQueue = requestQueueStorage.getFailedQueue();
      const item = failedQueue.find((i) => i.id === id);
      if (!item) return false;

      requestQueueStorage.removeFromFailedQueue(id);

      try {
        await executeRequest(item);
        invalidateAssociatedCaches(item.mutationType);
        refreshState();
        return true;
      } catch (error: any) {
        requestQueueStorage.addToFailedQueue({
          ...item,
          error: error?.message || 'Retry attempt failed',
          lastAttemptAt: Date.now(),
        });
        refreshState();
        return false;
      }
    },
    [refreshState]
  );

  /**
   * Retries all items in the failed queue
   */
  const retryAllFailed = useCallback(async (): Promise<void> => {
    const failedItems = requestQueueStorage.getFailedQueue();
    requestQueueStorage.clearFailedQueue();

    for (const item of failedItems) {
      requestQueueStorage.enqueue(item);
    }

    refreshState();
    await flush();
  }, [flush, refreshState]);

  /**
   * Clears the failed queue
   */
  const clearFailed = useCallback(() => {
    requestQueueStorage.clearFailedQueue();
    refreshState();
  }, [refreshState]);

  return {
    queue,
    failedQueue,
    isSyncing,
    syncState,
    enqueue,
    flush,
    retryFailedItem,
    retryAllFailed,
    clearFailed,
    removeQueuedItem,
  };
}
