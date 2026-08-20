import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface AndroidChannelConfig {
  channelId: string;
  name: string;
  importance: Notifications.AndroidImportance;
  vibrationPattern?: number[];
  sound?: string | boolean;
  lightColor?: string;
  description?: string;
}

export const ANDROID_CHANNELS: AndroidChannelConfig[] = [
  {
    channelId: 'booking',
    name: 'Booking Updates',
    description: 'Critical notifications for booking acceptance, worker arrival, and status changes',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#16A34A',
    sound: 'default',
  },
  {
    channelId: 'chat',
    name: 'Chat Messages',
    description: 'Real-time messages from assigned service professionals',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  },
  {
    channelId: 'payment',
    name: 'Payments & Receipts',
    description: 'Payment confirmations, refunds, and invoice alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200],
    sound: 'default',
  },
  {
    channelId: 'marketing',
    name: 'Promotions & Offers',
    description: 'Discounts, seasonal campaigns, and service recommendations',
    importance: Notifications.AndroidImportance.LOW,
    sound: undefined,
  },
  {
    channelId: 'default',
    name: 'General Alerts',
    description: 'General system notifications and account updates',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  },
];

export const IOS_CATEGORIES: Notifications.NotificationCategory[] = [
  {
    identifier: 'booking_alert',
    actions: [
      {
        identifier: 'VIEW_BOOKING',
        buttonTitle: 'View Booking',
        options: {
          opensAppToForeground: true,
        },
      },
    ],
  },
  {
    identifier: 'chat_message',
    actions: [
      {
        identifier: 'REPLY_CHAT',
        buttonTitle: 'Reply',
        options: {
          opensAppToForeground: true,
        },
      },
    ],
  },
];

/**
 * Registers all Android notification channels and iOS categories with the OS.
 */
export async function setupNotificationChannelsAndCategories(): Promise<void> {
  if (Platform.OS === 'android') {
    for (const ch of ANDROID_CHANNELS) {
      await Notifications.setNotificationChannelAsync(ch.channelId, {
        name: ch.name,
        description: ch.description,
        importance: ch.importance,
        vibrationPattern: ch.vibrationPattern,
        lightColor: ch.lightColor,
        sound: ch.sound === 'default' ? 'default' : undefined,
        showBadge: true,
      });
    }
  }

  if (Platform.OS === 'ios') {
    for (const cat of IOS_CATEGORIES) {
      await Notifications.setNotificationCategoryAsync(cat.identifier, cat.actions, cat.options);
    }
  }
}
