import { createMMKV } from 'react-native-mmkv';
import { apiClient } from './client';
import { useAuthStore } from '../../store/auth.store';
import {
  Message,
  ChatRoom,
  ChatHistoryResponse,
  ChatMediaUploadResponse,
} from '../../types/chat.types';

const chatStorage = createMMKV({ id: 'tasklync_chat_cache' });

export function getCachedChatMessages(bookingId: string): Message[] {
  try {
    const raw = chatStorage.getString(`chat_msgs_${bookingId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCachedChatMessages(bookingId: string, messages: Message[]): void {
  try {
    chatStorage.set(`chat_msgs_${bookingId}`, JSON.stringify(messages));
  } catch {
    // MMKV fallback safe
  }
}

export const chatApi = {
  /**
   * 2.1 List Customer Chat Rooms
   * GET /api/v1/chat/rooms
   */
  listRooms: async (): Promise<ChatRoom[]> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return [];

    try {
      const response = await apiClient.get<any>('/chat/rooms');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (_error) {
      return [];
    }
  },

  /**
   * 2.2 Get Room Details
   * GET /api/v1/chat/rooms/:bookingId
   */
  getRoomDetails: async (bookingId: string): Promise<ChatRoom | null> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return null;

    try {
      const response = await apiClient.get<any>(`/chat/rooms/${bookingId}`);
      return response.data?.data || response.data || null;
    } catch (_error) {
      return null;
    }
  },

  /**
   * 2.3 Get Message History (Cursor-based Pagination)
   * GET /api/v1/chat/rooms/:bookingId/messages
   */
  getMessages: async (
    bookingId: string,
    cursor?: string | null,
    limit: number = 30
  ): Promise<ChatHistoryResponse> => {
    const token = useAuthStore.getState().accessToken;

    if (!token) {
      const cached = getCachedChatMessages(bookingId);
      return {
        messages: cached,
        has_more: false,
      };
    }

    try {
      // Primary route per CHAT_SERVICE_CUSTOMER_API_SPECIFICATION.md
      const response = await apiClient.get<any>(`/chat/rooms/${bookingId}/messages`, {
        params: { cursor: cursor || undefined, limit },
      });

      const data = response.data?.data || response.data;
      const rawMessages = Array.isArray(data) ? data : Array.isArray(data?.messages) ? data.messages : [];

      const normalizedMessages: Message[] = rawMessages.map((m: any) => ({
        id: m.id || `msg_${Date.now()}`,
        room_id: m.room_id || m.roomId,
        booking_id: m.booking_id || m.bookingId || bookingId,
        sender_id: m.sender_id || m.senderId,
        sender_type: m.sender_type || m.senderType || 'user',
        type: m.type || 'text',
        content: m.content || '',
        media_url: m.media_url || m.mediaUrl || undefined,
        media_thumbnail_url: m.media_thumbnail_url || m.mediaThumbnailUrl || undefined,
        metadata: m.metadata || undefined,
        status: m.status || 'delivered',
        read_by: Array.isArray(m.read_by) ? m.read_by : Array.isArray(m.readBy) ? m.readBy : [],
        created_at: m.created_at || m.createdAt || new Date().toISOString(),
      }));

      // Cache historical messages locally
      saveCachedChatMessages(bookingId, normalizedMessages);

      return {
        messages: normalizedMessages,
        next_cursor: response.data?.meta?.next_cursor || data?.next_cursor || null,
        has_more: !!(response.data?.meta?.has_more ?? data?.has_more),
      };
    } catch (_error) {
      const cached = getCachedChatMessages(bookingId);
      return {
        messages: cached,
        has_more: false,
      };
    }
  },

  /**
   * 2.4 Upload Media (Images)
   * POST /api/v1/chat/rooms/:bookingId/messages/media
   */
  uploadMedia: async (
    bookingId: string,
    fileUri: string,
    mimeType: string = 'image/jpeg'
  ): Promise<ChatMediaUploadResponse> => {
    const token = useAuthStore.getState().accessToken;

    if (!token) {
      return { media_url: fileUri };
    }

    try {
      const formData = new FormData();
      const filename = fileUri.split('/').pop() || `chat_upload_${Date.now()}.jpg`;

      formData.append('file', {
        uri: fileUri,
        name: filename,
        type: mimeType,
      } as any);

      const response = await apiClient.post<any>(
        `/chat/rooms/${bookingId}/messages/media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = response.data?.data || response.data;
      return {
        media_url: data?.media_url || data?.mediaUrl || fileUri,
        media_thumbnail_url: data?.media_thumbnail_url || data?.mediaThumbnailUrl || undefined,
      };
    } catch (_error) {
      return { media_url: fileUri };
    }
  },

  /**
   * 2.5 Mark Messages as Read
   * PATCH /api/v1/chat/rooms/:bookingId/read
   */
  markAsRead: async (bookingId: string): Promise<void> => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    try {
      await apiClient.patch(`/chat/rooms/${bookingId}/read`, {});
    } catch (_error) {
      // Silent error handling for background read receipt
    }
  },
};
