import { useContext, createContext } from 'react';
import { socketService } from '../services/socket/socket.service';

export const SocketContext = createContext<typeof socketService>(socketService);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
