export type LanguageCode = 'en' | 'ur';

export type CurrencyCode = 'PKR' | 'USD';

export interface PushNotificationPreferences {
  booking_updates: boolean;
  chat_messages: boolean;
  promotions: boolean;
}

export interface SmsNotificationPreferences {
  booking_confirmations: boolean;
}

export interface NotificationPreferences {
  push: PushNotificationPreferences;
  sms: SmsNotificationPreferences;
}

export interface AppPreferences {
  language: LanguageCode;
  currency: CurrencyCode;
  notifications: NotificationPreferences;
}

export type NotificationPrefKey =
  | 'push.booking_updates'
  | 'push.chat_messages'
  | 'push.promotions'
  | 'sms.booking_confirmations';
