import { useEffect, useRef, DependencyList } from 'react';
import { useSocket } from './useSocket';

/**
 * Generic subscribe / auto-unsubscribe wrapper hook for socket events.
 * Guarantees zero memory leaks by automatically unsubscribing on unmount or dependency changes.
 */
export function useSocketEvent<T = any>(
  eventName: string,
  handler: (payload: T) => void,
  deps: DependencyList = []
): void {
  const socket = useSocket();
  const handlerRef = useRef(handler);

  handlerRef.current = handler;

  useEffect(() => {
    if (!eventName) return;

    const eventListener = (payload: T) => {
      handlerRef.current?.(payload);
    };

    const unsubscribe = socket.on(eventName, eventListener);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      } else {
        socket.off(eventName, eventListener);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, socket, ...deps]);
}
