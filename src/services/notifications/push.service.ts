import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { NotificationPermissionStatus } from '../../types/notification.types';
import { setupNotificationChannelsAndCategories } from './notification-categories';

/**
 * Configure foreground notification presentation handler safely.
 * Provides backwards and forwards compatibility across Expo SDKs.
 */
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAlert: true,
    }),
    handleSuccess: () => {},
    handleError: (notificationId, error) => {
      if (__DEV__) {
        console.warn(`[pushService] Notification handling error (${notificationId}):`, error);
      }
    },
  });
} catch (e) {
  if (__DEV__) {
    console.warn('[pushService] setNotificationHandler initialization warning:', e);
  }
}

export const pushService = {
  /**
   * Reads the current OS notification permission status without prompting.
   */
  getPermissionStatus: async (): Promise<NotificationPermissionStatus> => {
    try {
      if (Platform.OS === 'web') return 'granted';
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') return 'granted';
      if (status === 'denied') return 'denied';
      return 'undetermined';
    } catch {
      return 'undetermined';
    }
  },

  /**
   * Prompts the user with the native OS notification permission dialog (Android 13+ POST_NOTIFICATIONS & iOS APNs).
   */
  requestPermission: async (): Promise<NotificationPermissionStatus> => {
    try {
      if (Platform.OS === 'web') return 'granted';
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
   * Universal token retrieval: Safely retrieves native FCM/APNs device token or Expo push token.
   * Checks Device.isDevice and wraps native calls with try/catch to prevent simulator/hardware fatal exceptions.
   */
  getPushToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') return null;

      // 1. Guard against Simulator/Emulator native FCM bridge fatal crashes
      if (!Device.isDevice) {
        if (__DEV__) {
          console.log('[pushService] Running in simulator/emulator - physical device recommended for native push tokens');
        }
      }

      // 2. Try Native Device Push Token (FCM on Android / APNs on iOS)
      try {
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        if (deviceToken?.data) {
          return String(deviceToken.data);
        }
      } catch (nativeErr) {
        if (__DEV__) {
          console.log('[pushService] Native getDevicePushTokenAsync fallback:', nativeErr);
        }
      }

      // 3. Fallback to Expo Push Token
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ||
          Constants?.easConfig?.projectId ||
          process.env.EAS_PROJECT_ID ||
          '90b1f7d5-14e1-4cf6-9035-b1beb8832a36';

        const tokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );

        return tokenData?.data ? String(tokenData.data) : null;
      } catch (expoTokenErr) {
        if (__DEV__) {
          console.warn('[pushService] getExpoPushTokenAsync fallback:', expoTokenErr);
        }
        return null;
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[pushService] Failed to retrieve push token:', error);
      }
      return null;
    }
  },

  /**
   * Registers Android notification channels and iOS categories safely.
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
    return Notifications.addNotificationReceivedListener((notif) => {
      try {
        callback(notif);
      } catch (err) {
        if (__DEV__) {
          console.warn('[pushService] Foreground listener callback error:', err);
        }
      }
    });
  },

  /**
   * Subscribes to notification response (user tapped notification in tray).
   */
  addResponseListener: (
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription => {
    return Notifications.addNotificationResponseReceivedListener((res) => {
      try {
        callback(res);
      } catch (err) {
        if (__DEV__) {
          console.warn('[pushService] Response listener callback error:', err);
        }
      }
    });
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
   * Sets or clears the app icon badge count safely.
   */
  setBadgeCount: async (count: number): Promise<void> => {
    try {
      await Notifications.setBadgeCountAsync(Math.max(0, count));
    } catch {}
  },

  /**
   * Subscribes to device push token changes (rotations).
   */
  addPushTokenListener: (
    callback: (token: Notifications.DevicePushToken | Notifications.ExpoPushToken | any) => void
  ): Notifications.EventSubscription => {
    return Notifications.addPushTokenListener((token) => {
      try {
        callback(token);
      } catch (err) {
        if (__DEV__) {
          console.warn('[pushService] Push token listener callback error:', err);
        }
      }
    });
  },
};
