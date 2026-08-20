export type NotificationCategory =
  | 'booking'
  | 'payment'
  | 'chat'
  | 'review'
  | 'worker'
  | 'platform'
  | 'marketing';

export type NotificationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface NotificationItem {
  id: string;
  category: NotificationCategory | string;
  template_key: string;
  title: string;
  body: string;
  deep_link: string | null;
  is_read: boolean;
  created_at: string;
  campaign_id?: string | null;
  data?: Record<string, any>;
}

export interface NotificationFeedResponse {
  data: NotificationItem[];
  meta: {
    next_cursor?: string | null;
    has_more: boolean;
    unread_count?: number;
  };
}

export interface CategoryPreference {
  category: NotificationCategory;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
}

export interface UpdatePreferencePayload {
  category: NotificationCategory;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
}

export interface RawNotificationPayload {
  type?: string;
  template_key?: string;
  templateKey?: string;
  bookingId?: string;
  booking_id?: string;
  workerId?: string;
  worker_id?: string;
  conversationId?: string;
  conversation_id?: string;
  deep_link?: string;
  deepLink?: string;
  [key: string]: any;
}
