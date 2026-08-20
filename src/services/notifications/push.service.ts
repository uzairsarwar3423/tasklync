import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { NotificationPermissionStatus } from '../../types/notification.types';
import { setupNotificationChannelsAndCategories } from './notification-categories';

// Configure foreground notification presentation handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldPresentAlert: true,
    shouldPresentSound: true,
    shouldPresentBadge: true,
  }),
});

export const pushService = {
  /**
   * Reads the current OS notification permission status without prompting.
   */
  getPermissionStatus: async (): Promise<NotificationPermissionStatus> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') return 'granted';
      if (status === 'denied') return 'denied';
      return 'undetermined';
    } catch {
      return 'undetermined';
    }
  },

  /**
   * Prompts the user with the native OS notification permission dialog.
   */
  requestPermission: async (): Promise<NotificationPermissionStatus> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      if (status === 'granted') return 'granted';
      if (status === 'denied') return 'denied';
      return 'undetermined';
    } catch {
      return 'denied';
    }
  },

  /**
   * Universal token retrieval: Retrieves native FCM/APNs device token or Expo push token.
   */
  getPushToken: async (): Promise<string | null> => {
    try {
      // 1. Try Native Device Push Token (FCM on Android / APNs on iOS)
      if (Platform.OS !== 'web') {
        try {
          const deviceToken = await Notifications.getDevicePushTokenAsync();
          if (deviceToken?.data) {
            return deviceToken.data;
          }
        } catch {}
      }

      // 2. Fallback to Expo Push Token
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId ||
        '231e181a-e4bc-4d71-9434-e4b9b5507a90';

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return tokenData.data || null;
    } catch (error) {
      if (__DEV__) {
        console.warn('[pushService] Failed to retrieve device push token:', error);
      }
      return null;
    }
  },

  /**
   * Registers Android notification channels and iOS categories.
   */
  registerNotificationChannels: async (): Promise<void> => {
    try {
      await setupNotificationChannelsAndCategories();
    } catch (error) {
      if (__DEV__) {
        console.warn('[pushService] Failed to setup notification channels:', error);
      }
    }
  },

  /**
   * Subscribes to foreground notification reception.
   */
  addForegroundListener: (
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Subscribes to notification response (user tapped notification in tray).
   */
  addResponseListener: (
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Checks for a cold-start notification response when the app was launched from a killed state.
   */
  getLastNotificationResponse: async (): Promise<Notifications.NotificationResponse | null> => {
    try {
      return await Notifications.getLastNotificationResponseAsync();
    } catch {
      return null;
    }
  },

  /**
   * Sets or clears the app icon badge count.
   */
  setBadgeCount: async (count: number): Promise<void> => {
    try {
      await Notifications.setBadgeCountAsync(Math.max(0, count));
    } catch {}
  },
};
