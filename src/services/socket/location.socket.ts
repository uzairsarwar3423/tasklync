import { socketService } from './socket.service';

export const locationSocket = {
  subscribeToWorker: (bookingId: string) => {
    socketService.emit('location:subscribe', { bookingId });
  },
  
  unsubscribeFromWorker: (bookingId: string) => {
    socketService.emit('location:unsubscribe', { bookingId });
  },
};
