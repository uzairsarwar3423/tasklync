import { create } from 'zustand';

export type ConnectionQuality = 'good' | 'degraded' | 'offline';

interface SocketState {
  isConnected: boolean;
  lastConnectedAt: Date | null;
  reconnectAttempts: number;
  connectionQuality: ConnectionQuality;
  
  setConnected: () => void;
  setDisconnected: () => void;
  incrementReconnectAttempt: () => void;
  resetAttempts: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  isConnected: false,
  lastConnectedAt: null,
  reconnectAttempts: 0,
  connectionQuality: 'offline',

  setConnected: () => set({
    isConnected: true,
    lastConnectedAt: new Date(),
    reconnectAttempts: 0,
    connectionQuality: 'good',
  }),

  setDisconnected: () => set((state) => ({
    isConnected: false,
    connectionQuality: state.reconnectAttempts > 3 ? 'offline' : 'degraded',
  })),

  incrementReconnectAttempt: () => set((state) => {
    const newAttempts = state.reconnectAttempts + 1;
    let quality: ConnectionQuality = 'good';
    
    if (newAttempts > 0 && newAttempts <= 2) {
      quality = 'degraded';
    } else if (newAttempts > 2) {
      quality = 'offline';
    }

    return {
      reconnectAttempts: newAttempts,
      connectionQuality: quality,
    };
  }),

  resetAttempts: () => set({
    reconnectAttempts: 0,
    connectionQuality: get().isConnected ? 'good' : 'offline',
  }),
}));
