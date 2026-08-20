import { apiClient } from './client';
import {
  NotificationFeedResponse,
  CategoryPreference,
  UpdatePreferencePayload,
  NotificationItem,
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
   * 3.2 Mark Single Notification Read
   * PATCH /api/v1/notifications/:id/read
   */
  markAsRead: async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.patch<any>(`/notifications/${id}/read`);
      return response.data?.success ?? true;
    } catch {
      return false;
    }
  },

  /**
   * 3.3 Mark All Notifications Read
   * PATCH /api/v1/notifications/read-all
   */
  markAllAsRead: async (): Promise<number> => {
    try {
      const response = await apiClient.patch<any>('/notifications/read-all');
      return response.data?.data?.marked_read ?? response.data?.marked_read ?? 0;
    } catch {
      return 0;
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
        await apiClient.patch('/users/profile', { fcm_token: token, push_enabled: true });
        return true;
      } catch {
        return false;
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
      return false;
    }
  },
};
