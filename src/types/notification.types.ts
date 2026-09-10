export type NotificationCategory =
  | 'booking'
  | 'payment'
  | 'chat'
  | 'review'
  | 'worker'
  | 'platform'
  | 'marketing'
  | string;

export type NotificationTemplateKey =
  | 'booking_accepted'
  | 'booking_started'
  | 'booking_completed'
  | 'booking_rejected'
  | 'booking_cancelled_by_worker'
  | 'booking_cancelled_by_user'
  | 'booking_completion_requested'
  | 'payment_received'
  | 'payment_held'
  | 'payment_released'
  | 'payout_completed'
  | 'new_chat_message'
  | 'new_review_received'
  | 'review_reported_alert'
  | 'worker_verified'
  | 'worker_arrived'
  | 'worker_en_route'
  | 'dispute_opened_against_you'
  | 'independence_day_greeting'
  | 'category_trending_nudge'
  | string;

export type NotificationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface DetailedNotificationPermission {
  status: NotificationPermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
  expires?: 'never' | number | undefined;
}

export type NotificationFilter = 'all' | 'unread';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  template_key: NotificationTemplateKey;
  title: string;
  body: string;
  deep_link: string | null;
  is_read: boolean;
  created_at: string;
  campaign_id?: string | null | undefined;
  data?: Record<string, any> | undefined;
}

export interface NotificationFeedMeta {
  next_cursor?: string | null | undefined;
  has_more: boolean;
  unread_count?: number | undefined;
}

export interface NotificationFeedResponse {
  data: NotificationItem[];
  meta: NotificationFeedMeta;
}

// Flat FlashList Item Types for Date Section Injection
export interface NotificationHeaderItem {
  type: 'header';
  id: string;
  title: string;
  dateKey: string;
  count: number;
}

export interface NotificationRowItem {
  type: 'notification';
  id: string;
  notification: NotificationItem;
}

export type NotificationListItem = NotificationHeaderItem | NotificationRowItem;

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
  type?: string | undefined;
  category?: string | undefined;
  template_key?: string | undefined;
  templateKey?: string | undefined;
  bookingId?: string | undefined;
  booking_id?: string | undefined;
  booking_uuid?: string | undefined;
  workerId?: string | undefined;
  worker_id?: string | undefined;
  conversationId?: string | undefined;
  conversation_id?: string | undefined;
  deep_link?: string | undefined;
  deepLink?: string | undefined;
  [key: string]: any;
}
