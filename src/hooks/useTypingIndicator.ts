import { useRef, useCallback, useEffect } from 'react';
import { chatSocket } from '../services/socket/chat.socket';

/**
 * Custom hook to handle debounced typing event emissions and auto-clear on inactivity.
 *
 * Rules:
 * - Emits 'typing_start' at most once every 3000ms.
 * - Emits 'typing_stop' after 2000ms of inactivity.
 * - Emits 'typing_stop' immediately when stopTypingImmediately() is invoked (e.g. on message send).
 */
export function useTypingIndicator(bookingId: string) {
  const isTypingRef = useRef<boolean>(false);
  const lastEmitTimeRef = useRef<number>(0);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTypingImmediately = useCallback(() => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (isTypingRef.current && bookingId) {
      chatSocket.stopTyping(bookingId);
      isTypingRef.current = false;
      lastEmitTimeRef.current = 0;
    }
  }, [bookingId]);

  const notifyTyping = useCallback(() => {
    if (!bookingId) return;

    const now = Date.now();
    // Throttle typing_start emission to once per 3000ms
    if (!isTypingRef.current || now - lastEmitTimeRef.current > 3000) {
      chatSocket.startTyping(bookingId);
      isTypingRef.current = true;
      lastEmitTimeRef.current = now;
    }

    // Reset inactivity timeout (2000ms)
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
    }

    stopTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && bookingId) {
        chatSocket.stopTyping(bookingId);
        isTypingRef.current = false;
        lastEmitTimeRef.current = 0;
      }
    }, 2000);
  }, [bookingId]);

  // Clean up timer and emit stop on unmount
  useEffect(() => {
    return () => {
      stopTypingImmediately();
    };
  }, [stopTypingImmediately]);

  return {
    notifyTyping,
    stopTypingImmediately,
  };
}
