export type ConnectionType =
  | 'wifi'
  | 'cellular'
  | 'bluetooth'
  | 'ethernet'
  | 'wimax'
  | 'vpn'
  | 'other'
  | 'unknown'
  | 'none';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: ConnectionType;
  isOffline: boolean;
  details?: Record<string, any> | null;
}

export type QueuedMutationType =
  | 'CREATE_BOOKING'
  | 'CANCEL_BOOKING'
  | 'UPDATE_CART'
  | 'SEND_CHAT_MESSAGE'
  | 'SUBMIT_REVIEW'
  | 'MARK_NOTIFICATION_READ'
  | 'PAYMENT_INTENT'
  | (string & {});

export interface QueuedRequest<T = any> {
  id: string;
  mutationType: QueuedMutationType;
  payload: T;
  createdAt: number;
  idempotencyKey: string;
  retryCount: number;
  lastAttemptAt?: number;
  error?: string;
}

export interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
  totalToSync: number;
  failedCount: number;
  lastSyncedAt: number | null;
}

export interface NetworkContextValue {
  networkStatus: NetworkStatus;
  isOffline: boolean;
  syncState: SyncState;
  queue: QueuedRequest[];
  failedQueue: QueuedRequest[];
  enqueueRequest: <T = any>(
    mutationType: QueuedMutationType,
    payload: T,
    idempotencyKey?: string
  ) => QueuedRequest<T>;
  flushQueue: () => Promise<{ succeeded: number; failed: number; dropped: number }>;
  retryFailedRequest: (id: string) => Promise<boolean>;
  retryAllFailedRequests: () => Promise<void>;
  clearFailedRequests: () => void;
}
