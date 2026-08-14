import { io, Socket } from 'socket.io-client';
import { SOCKET_CONFIG } from '../../config/socket.config';
import { useSocketStore } from '../../store/socket.store';

class SocketService {
  private socket: Socket | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Connects to the socket server.
   * @param token Authentication JWT token
   */
  public connect(token: string): void {
    if (this.socket?.connected) return;

    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_CONFIG.SOCKET_URL, {
      path: '/chat',
      auth: { token },
      query: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    this.attachInternalListeners();
  }

  /**
   * Disconnects and resets internal state gracefully.
   */
  public disconnect(): void {
    this.clearTimers();
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    useSocketStore.getState().setDisconnected();
  }

  /**
   * Safe emit that guards against disconnected state
   */
  public emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn(`[SocketService] Dropped event ${event} - socket disconnected`);
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Subscribes to an event and returns an unsubscribe function.
   */
  public on(event: string, handler: (payload: any) => void): () => void {
    if (!this.socket) {
      // If socket isn't instantiated yet, we might miss events.
      // In a real scenario, we might queue listeners or warn.
      console.warn(`[SocketService] .on called for ${event} before socket exists.`);
      return () => {};
    }

    this.socket.on(event, handler);
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribes an event handler.
   */
  public off(event: string, handler: (payload: any) => void): void {
    this.socket?.off(event, handler);
  }

  public isConnected(): boolean {
    return !!this.socket?.connected;
  }

  private attachInternalListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.clearTimers();
      useSocketStore.getState().setConnected();
      this.startHeartbeat();
    });

    this.socket.on('disconnect', (reason) => {
      this.clearTimers();
      useSocketStore.getState().setDisconnected();
      
      // If server disconnected us, or network failed, attempt reconnect
      // If we called disconnect manually, reason is 'io client disconnect'
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (err) => {
      useSocketStore.getState().setDisconnected();
      this.scheduleReconnect();
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, SOCKET_CONFIG.HEARTBEAT_INTERVAL_MS);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    const { reconnectAttempts } = useSocketStore.getState();
    const delays = SOCKET_CONFIG.RECONNECT_DELAYS_MS;
    
    // Cap at the maximum delay
    const delay = delays[Math.min(reconnectAttempts, delays.length - 1)];

    useSocketStore.getState().incrementReconnectAttempt();

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }, delay);
  }

  private clearTimers(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

export const socketService = new SocketService();
