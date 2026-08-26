import { apiClient } from './client';
import {
  NotificationFeedResponse,
  CategoryPreference,
  UpdatePreferencePayload,
} from '../../types/notification.types';

export const notificationApi = {
  /**
   * 3.1 List Customer Notifications Feed & Unread Count (Cursor-based pagination)
   * GET /api/v1/notifications
   */
  getNotifications: async (
    cursor?: string | null,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<NotificationFeedResponse> => {
    try {
      const response = await apiClient.get<any>('/notifications', {
        params: {
          cursor: cursor || undefined,
          limit,
          unread_only: unreadOnly ? true : undefined,
        },
      });

      const data = response.data?.data || response.data || [];
      const meta = response.data?.meta || {};

      return {
        data: Array.isArray(data) ? data : [],
        meta: {
          next_cursor: meta.next_cursor || null,
          has_more: !!meta.has_more,
          unread_count: meta.unread_count,
        },
      };
    } catch (_error) {
      return {
        data: [],
        meta: {
          next_cursor: null,
          has_more: false,
          unread_count: 0,
        },
      };
    }
  },

  /**
   * Fetch Isolated Unread Count
   * GET /api/v1/notifications/unread-count or fallback to GET /notifications?limit=1
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      // 1. Try dedicated unread-count endpoint
      const res = await apiClient.get<any>('/notifications/unread-count');
      const count =
        res.data?.data?.unread_count ??
        res.data?.unread_count ??
        res.data?.data?.count ??
        res.data?.count;
      if (typeof count === 'number') {
        return Math.max(0, count);
      }
    } catch {
      // Fallback: Query page 1 metadata with limit 1
      try {
        const fallbackRes = await apiClient.get<any>('/notifications', {
          params: { limit: 1 },
        });
        const unreadCount = fallbackRes.data?.meta?.unread_count;
        if (typeof unreadCount === 'number') {
          return Math.max(0, unreadCount);
        }
      } catch {
        return 0;
      }
    }
    return 0;
  },

  /**
   * 3.2 Mark Single Notification Read
   * PATCH /api/v1/notifications/:id/read
   */
  markRead: async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.patch<any>(`/notifications/${id}/read`);
      return response.data?.success ?? true;
    } catch {
      return false;
    }
  },

  /**
   * Alias for backward compatibility
   */
  markAsRead: async (id: string): Promise<boolean> => {
    return notificationApi.markRead(id);
  },

  /**
   * 3.3 Mark All Notifications Read
   * PATCH /api/v1/notifications/read-all
   */
  markAllRead: async (): Promise<number> => {
    try {
      const response = await apiClient.patch<any>('/notifications/read-all');
      return response.data?.data?.marked_read ?? response.data?.marked_read ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Alias for backward compatibility
   */
  markAllAsRead: async (): Promise<number> => {
    return notificationApi.markAllRead();
  },

  /**
   * Delete or Dismiss a notification
   * DELETE /api/v1/notifications/:id
   */
  deleteNotification: async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete<any>(`/notifications/${id}`);
      return response.data?.success ?? true;
    } catch (_error) {
      // If server does not have DELETE route or returns 404/405, allow client-side dismissal
      return true;
    }
  },

  /**
   * 3.4 Get Notification Category Preferences
   * GET /api/v1/notifications/preferences
   */
  getPreferences: async (): Promise<CategoryPreference[]> => {
    try {
      const response = await apiClient.get<any>('/notifications/preferences');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /**
   * 3.5 Update Category Preference
   * PUT /api/v1/notifications/preferences
   */
  updatePreference: async (payload: UpdatePreferencePayload): Promise<CategoryPreference | null> => {
    try {
      const response = await apiClient.put<any>('/notifications/preferences', payload);
      return response.data?.data || response.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Register Device FCM/Expo Push Token with backend
   * POST /api/v1/users/me/fcm-token
   */
  registerPushToken: async (token: string): Promise<boolean> => {
    try {
      await apiClient.post('/users/me/fcm-token', { token });
      return true;
    } catch {
      try {
        await apiClient.post('/notifications/device-token', { token });
        return true;
      } catch {
        try {
          await apiClient.patch('/users/profile', { fcm_token: token, push_enabled: true });
          return true;
        } catch {
          return false;
        }
      }
    }
  },

  /**
   * Unregister Device Push Token on user logout
   * POST /api/v1/users/me/fcm-token (with empty/null token)
   */
  unregisterPushToken: async (): Promise<boolean> => {
    try {
      await apiClient.post('/users/me/fcm-token', { token: null });
      return true;
    } catch {
      try {
        await apiClient.post('/notifications/device-token', { token: null });
        return true;
      } catch {
        return false;
      }
    }
  },
};
