import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { socketService } from '../services/socket/socket.service';
import { SocketContext } from '../hooks/useSocket';
import { useAuthStore } from '../store/auth.store';
import { useSocketStore } from '../store/socket.store';
import { useAppState } from '../hooks/useAppState';

interface SocketProviderProps {
  children: React.ReactNode;
}

/**
 * SocketProvider encapsulates the complete lifecycle of the real-time WebSocket connection.
 * Lifecycle Rules:
 * 1. On mount / token restored -> connect
 * 2. On login success -> connect
 * 3. On logout -> disconnect immediately and reset socket store
 * 4. On app foreground -> reconnect if token exists and not connected
 * 5. On network restore (NetInfo) -> reconnect if token exists and not connected
 * 6. On app background -> do NOT disconnect eagerly to prevent reconnect storms
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  // 1, 2, 3: Connect when token is available, disconnect immediately on logout
  useEffect(() => {
    if (accessToken) {
      socketService.connect(accessToken);
    } else {
      socketService.disconnect();
      useSocketStore.getState().resetAttempts();
    }
  }, [accessToken]);

  // 4: Handle app foreground transitions
  useAppState(
    // onForeground
    () => {
      const currentToken = useAuthStore.getState().accessToken;
      if (currentToken && !socketService.isConnected()) {
        socketService.connect(currentToken);
      }
    },
    // onBackground: Point 6 — intentionally empty to avoid disconnect storms
    undefined
  );

  // 5: Handle network restore (NetInfo)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      if (netState.isConnected && netState.isInternetReachable !== false) {
        const currentToken = useAuthStore.getState().accessToken;
        if (currentToken && !socketService.isConnected()) {
          socketService.connect(currentToken);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
};
