import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { socketService } from '../services/socket/socket.service';
import { SocketContext } from '../hooks/useSocket';
import { useAuthStore } from '../store/auth.store';
import { useSocketStore } from '../store/socket.store';
import { useChatUnreadStore } from '../store/chatUnread.store';
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

  // 6: Global real-time listener for incoming messages to increment TabBar badge
  useEffect(() => {
    if (!accessToken) return;

    const handleGlobalMessage = (data: any) => {
      const bId = data?.booking_id || data?.bookingId || data?.room_id || data?.roomId;
      const senderType = data?.sender_type || data?.senderType;
      const senderId = data?.sender_id || data?.senderId;
      const currentUserId = useAuthStore.getState().user?.id;
      const isFromOther = senderType === 'worker' || (senderId && senderId !== currentUserId);

      if (bId && isFromOther) {
        useChatUnreadStore.getState().incrementUnread(bId);
      }
    };

    const unsub1 = socketService.on('message_received', handleGlobalMessage);
    const unsub2 = socketService.on('chat:message_received', handleGlobalMessage);
    const unsub3 = socketService.on('new_message', handleGlobalMessage);

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
};
