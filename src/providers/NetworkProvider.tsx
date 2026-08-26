import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { OfflineBanner } from '../components/feedback/OfflineBanner';
import { SyncIndicator } from '../components/feedback/SyncIndicator';
import { useToast } from './ToastProvider';
import { NetworkContextValue, QueuedRequest } from '../types/network.types';

const NetworkContext = createContext<NetworkContextValue | null>(null);

/**
 * NetworkProvider (Day 39)
 * 
 * Root resilience provider managing:
 * 1. Single source of truth connectivity state
 * 2. Automatic queue flushing on offline -> online transitions
 * 3. Rendering of OfflineBanner & SyncIndicator
 * 4. Failed-sync recovery toasts with haptic alerts and manual retry
 */
export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const networkStatus = useNetworkStatus();
  const { isOffline } = networkStatus;
  const { showToast } = useToast();

  const handleFailedItems = useCallback(
    (failedItems: QueuedRequest[]) => {
      // Audited Section 8 Rule: Haptic fires ONLY on failed-after-retry (user attention required)
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}

      const count = failedItems.length;
      const message =
        count === 1
          ? "Couldn't sync 1 update. Check connection and retry."
          : `Couldn't sync ${count} updates. Check connection and retry.`;

      showToast({
        id: 'failed-sync-toast',
        message,
        variant: 'error',
        duration: 7000,
        action: {
          label: 'Retry',
          onPress: () => {
            retryAllFailed();
          },
        },
      });
    },
    [showToast]
  );

  const offlineQueue = useOfflineQueue(handleFailedItems);
  const {
    queue,
    failedQueue,
    syncState,
    enqueue,
    flush,
    retryFailedItem,
    retryAllFailed,
    clearFailed,
  } = offlineQueue;

  const previousOfflineRef = useRef<boolean>(isOffline);
  const isInitialMountRef = useRef<boolean>(true);

  // Trigger flush strictly on offline -> online transition
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      // On cold launch, if online and pending items exist in MMKV queue, trigger flush
      if (!isOffline && queue.length > 0) {
        flush();
      }
      previousOfflineRef.current = isOffline;
      return;
    }

    const wasOffline = previousOfflineRef.current;
    const isNowOnline = !isOffline;

    if (wasOffline && isNowOnline) {
      // Reconnected: Flush the queue in strict FIFO order
      console.log('[NetworkProvider] Connectivity restored. Initiating queue flush...');
      flush();
    }

    previousOfflineRef.current = isOffline;
  }, [isOffline, flush, queue.length]);

  const contextValue: NetworkContextValue = {
    networkStatus,
    isOffline,
    syncState,
    queue,
    failedQueue,
    enqueueRequest: enqueue,
    flushQueue: flush,
    retryFailedRequest: retryFailedItem,
    retryAllFailedRequests: retryAllFailed,
    clearFailedRequests: clearFailed,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
      {/* Zero Anxiety persistent top strip */}
      <OfflineBanner isOffline={isOffline} />
      {/* Goal-Gradient dynamic sync pill */}
      <SyncIndicator syncState={syncState} isOffline={isOffline} />
    </NetworkContext.Provider>
  );
};

export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
