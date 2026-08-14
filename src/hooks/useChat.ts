import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Message, MessageType, MessageRenderItem } from '../types/chat.types';
import { chatApi, saveCachedChatMessages } from '../services/api/chat.api';
import { chatSocket } from '../services/socket/chat.socket';
import { useSocketEvent } from './useSocketEvent';
import { useAuthStore } from '../store/auth.store';
import { groupMessagesForInvertedList } from '../utils/messageGrouping';

export function useChat(bookingId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isWorkerTyping, setIsWorkerTyping] = useState<boolean>(false);
  const [isRoomClosed, setIsRoomClosed] = useState<boolean>(false);

  const currentUserId = useAuthStore((s) => s.user?.id || 'current-user');
  const pendingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // 1. Initial Load of message history with resilience retry
  const loadHistory = useCallback(async (retryCount = 0) => {
    if (!bookingId) return;
    if (retryCount === 0) setIsLoading(true);
    try {
      const res = await chatApi.getMessages(bookingId, null, 50);
      setMessages(res.messages || []);
      setNextCursor(res.next_cursor);
      setHasMore(res.has_more);
      setIsLoading(false);
    } catch {
      if (retryCount < 3) {
        setTimeout(() => {
          loadHistory(retryCount + 1);
        }, 1000 * (retryCount + 1));
      } else {
        setMessages([]);
        setIsLoading(false);
      }
    }
  }, [bookingId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 2. Mark messages as read via REST PATCH
  const markRead = useCallback(() => {
    if (!bookingId) return;
    chatApi.markAsRead(bookingId);
  }, [bookingId]);

  // 3. Join / Leave Chat Room & 30s Heartbeat
  useEffect(() => {
    if (!bookingId) return;
    chatSocket.joinRoom(bookingId);
    markRead();

    // 30s Heartbeat to maintain Redis presence TTL
    const heartbeatTimer = setInterval(() => {
      chatSocket.sendHeartbeat();
    }, 30000);

    return () => {
      clearInterval(heartbeatTimer);
      chatSocket.leaveRoom(bookingId);
      pendingTimeoutsRef.current.forEach((t) => clearTimeout(t));
      pendingTimeoutsRef.current.clear();
    };
  }, [bookingId, markRead]);

  // 4. Socket Event Listeners per CHAT_SERVICE_CUSTOMER_API_SPECIFICATION.md
  // Helper for incoming message ingestion
  const handleIncomingMessage = useCallback(
    (data: any) => {
      if (!data) return;
      const incoming: Message = {
        id: data.id || data._id || `msg_${Date.now()}`,
        room_id: data.room_id || data.roomId,
        booking_id: data.booking_id || data.bookingId || bookingId,
        sender_id: data.sender_id || data.senderId || 'worker',
        sender_type: data.sender_type || data.senderType || 'worker',
        content: data.content || '',
        type: data.type || 'text',
        media_url: data.media_url || data.mediaUrl || undefined,
        media_thumbnail_url: data.media_thumbnail_url || data.mediaThumbnailUrl || undefined,
        metadata: data.metadata || undefined,
        status: data.status || 'delivered',
        read_by: Array.isArray(data.read_by) ? data.read_by : Array.isArray(data.readBy) ? data.readBy : [],
        created_at: data.created_at || data.createdAt || new Date().toISOString(),
        temp_id: data.temp_id || data.tempId,
      };

      setMessages((prev) => {
        // Check for optimistic reconciliation via temp_id
        const tempIdMatch = incoming.temp_id
          ? prev.findIndex((m) => m.temp_id === incoming.temp_id || m.id === incoming.temp_id)
          : -1;

        if (tempIdMatch >= 0) {
          const timeout = pendingTimeoutsRef.current.get(incoming.temp_id!);
          if (timeout) {
            clearTimeout(timeout);
            pendingTimeoutsRef.current.delete(incoming.temp_id!);
          }

          const updated = [...prev];
          updated[tempIdMatch] = {
            ...incoming,
            status: 'sent',
          };
          saveCachedChatMessages(bookingId, updated);
          return updated;
        }

        // Deduplication
        if (prev.some((m) => m.id === incoming.id)) {
          return prev;
        }

        const updated = [...prev, incoming];
        saveCachedChatMessages(bookingId, updated);
        return updated;
      });

      // Automatically mark as read if message is from worker
      if (incoming.sender_id !== currentUserId && incoming.sender_type === 'worker') {
        markRead();
      }
    },
    [bookingId, currentUserId, markRead]
  );

  useSocketEvent<any>('message_received', handleIncomingMessage);
  useSocketEvent<any>('chat:message_received', handleIncomingMessage);

  // Real-time Typing Listener (payload: { bookingId, userId, senderType, isTyping })
  const handleTypingEvent = useCallback(
    (data: any) => {
      if (data?.bookingId === bookingId || data?.booking_id === bookingId) {
        if (data?.senderType === 'worker' || data?.sender_type === 'worker') {
          setIsWorkerTyping(Boolean(data.isTyping ?? data.is_typing ?? true));
        }
      }
    },
    [bookingId]
  );

  useSocketEvent<any>('typing', handleTypingEvent);
  useSocketEvent<any>('chat:typing_start', useCallback((d) => d?.bookingId === bookingId && setIsWorkerTyping(true), [bookingId]));
  useSocketEvent<any>('chat:typing_stop', useCallback((d) => d?.bookingId === bookingId && setIsWorkerTyping(false), [bookingId]));

  // Message Read Listener (payload: { bookingId, readBy, messageIds })
  const handleMessageRead = useCallback(
    (data: any) => {
      if (data?.bookingId !== bookingId && data?.booking_id !== bookingId) return;
      const readerId = data.readBy || data.read_by || data.readerId;

      setMessages((prev) =>
        prev.map((m) => {
          if (m.sender_type === 'user' || m.sender_type === 'customer' || m.sender_id === currentUserId) {
            const currentReadBy = m.read_by || [];
            const updatedReadBy =
              readerId && !currentReadBy.includes(readerId)
                ? [...currentReadBy, readerId]
                : currentReadBy;
            return {
              ...m,
              status: 'read',
              read_by: updatedReadBy,
            };
          }
          return m;
        })
      );
    },
    [bookingId, currentUserId]
  );

  useSocketEvent<any>('message_read', handleMessageRead);
  useSocketEvent<any>('chat:message_read', handleMessageRead);

  // Room Closed Listener
  useSocketEvent<any>(
    'room_closed',
    useCallback(
      (data) => {
        if (data?.bookingId === bookingId || data?.booking_id === bookingId) {
          setIsRoomClosed(true);
        }
      },
      [bookingId]
    )
  );

  // 5. Send Message (Supports Text, Image, Location)
  const sendMessage = useCallback(
    async (content: string, type: MessageType = 'text', mediaFileUri?: string) => {
      if (!content.trim() && !mediaFileUri) return;
      if (isRoomClosed) return;

      let uploadedMediaUrl: string | undefined = undefined;

      // If image attachment, upload to CDN first
      if (type === 'image' && mediaFileUri) {
        try {
          const uploadRes = await chatApi.uploadMedia(bookingId, mediaFileUri);
          uploadedMediaUrl = uploadRes.media_url;
        } catch {
          uploadedMediaUrl = mediaFileUri;
        }
      }

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const optimisticMsg: Message = {
        id: tempId,
        temp_id: tempId,
        booking_id: bookingId,
        sender_id: currentUserId,
        sender_type: 'user',
        content: content.trim() || (type === 'image' ? 'Photo' : ''),
        type,
        media_url: uploadedMediaUrl || mediaFileUri,
        status: 'sending',
        read_by: [],
        created_at: new Date().toISOString(),
      };

      // Append optimistic message
      setMessages((prev) => {
        const next = [...prev, optimisticMsg];
        saveCachedChatMessages(bookingId, next);
        return next;
      });

      // Emit via Socket
      chatSocket.sendMessage({
        bookingId,
        type: type === 'system' ? 'text' : type,
        content: content.trim() || (type === 'image' ? 'Photo' : ''),
        mediaUrl: uploadedMediaUrl,
        tempId,
      });

      // 8-second reconciliation timeout
      const timeout = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === tempId && m.status === 'sending') {
              return { ...m, status: 'failed' };
            }
            return m;
          })
        );
        pendingTimeoutsRef.current.delete(tempId);
      }, 8000);

      pendingTimeoutsRef.current.set(tempId, timeout);
    },
    [bookingId, currentUserId, isRoomClosed]
  );

  // 6. Retry Failed Message
  const retrySendMessage = useCallback(
    async (tempId: string) => {
      const msg = messages.find((m) => m.id === tempId || m.temp_id === tempId);
      if (!msg) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === tempId || m.temp_id === tempId) {
            return { ...m, status: 'sending' };
          }
          return m;
        })
      );

      chatSocket.sendMessage({
        bookingId,
        type: msg.type === 'system' ? 'text' : msg.type,
        content: msg.content,
        mediaUrl: msg.media_url,
        tempId,
      });

      const timeout = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => {
            if ((m.id === tempId || m.temp_id === tempId) && m.status === 'sending') {
              return { ...m, status: 'failed' };
            }
            return m;
          })
        );
        pendingTimeoutsRef.current.delete(tempId);
      }, 8000);

      pendingTimeoutsRef.current.set(tempId, timeout);
    },
    [bookingId, messages]
  );

  // 7. Load more history (Cursor-based Pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingMore || !nextCursor) return;
    setIsFetchingMore(true);

    try {
      const res = await chatApi.getMessages(bookingId, nextCursor, 30);
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newUnique = (res.messages || []).filter((m) => !existingIds.has(m.id));
        const merged = [...newUnique, ...prev];
        saveCachedChatMessages(bookingId, merged);
        return merged;
      });
      setNextCursor(res.next_cursor);
      setHasMore(res.has_more);
    } finally {
      setIsFetchingMore(false);
    }
  }, [bookingId, hasMore, isFetchingMore, nextCursor]);

  // 8. Transform into grouped inverted render items
  const renderItems: MessageRenderItem[] = useMemo(() => {
    return groupMessagesForInvertedList(messages, currentUserId);
  }, [messages, currentUserId]);

  return {
    messages,
    renderItems,
    isLoading,
    isFetchingMore,
    hasMore,
    isWorkerTyping,
    isRoomClosed,
    sendMessage,
    retrySendMessage,
    loadMore,
    markRead,
    refetch: loadHistory,
  };
}
