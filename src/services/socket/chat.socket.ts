import { socketService } from './socket.service';

export interface SendMessageSocketPayload {
  bookingId: string;
  type: 'text' | 'image' | 'location';
  content: string;
  mediaUrl?: string | undefined;
  metadata?: Record<string, any> | undefined;
  tempId?: string | undefined;
}

export const chatSocket = {
  /**
   * 3.2.1 Join Room Channel
   */
  joinRoom: (bookingId: string) => {
    socketService.emit('join_room', { bookingId });
    socketService.emit('chat:join_room', { bookingId });
  },

  /**
   * 3.2.2 Leave Room Channel
   */
  leaveRoom: (bookingId: string) => {
    socketService.emit('leave_room', { bookingId });
    socketService.emit('chat:leave_room', { bookingId });
  },

  /**
   * 3.2.3 Send Message
   */
  sendMessage: (payload: SendMessageSocketPayload) => {
    socketService.emit('send_message', payload);
    socketService.emit('chat:send_message', payload);
  },

  /**
   * 3.2.4 Typing Start
   */
  startTyping: (bookingId: string) => {
    socketService.emit('typing_start', { bookingId });
    socketService.emit('chat:typing_start', { bookingId });
  },

  /**
   * 3.2.4 Typing Stop
   */
  stopTyping: (bookingId: string) => {
    socketService.emit('typing_stop', { bookingId });
    socketService.emit('chat:typing_stop', { bookingId });
  },

  /**
   * 3.2.5 Heartbeat (Send every 30s)
   */
  sendHeartbeat: () => {
    socketService.emit('heartbeat', {});
  },
};
