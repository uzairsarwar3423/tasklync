import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../store/auth.store';
import { useNotificationStore } from '../store/notification.store';
import { pushService } from '../services/notifications/push.service';
import { notificationQueue } from '../services/notifications/notification-queue';
import { resolveNotificationRoute } from '../utils/deepLink';
import { usePushRegistration } from '../hooks/usePushRegistration';
import { useInAppBanner } from '../components/feedback/InAppBannerProvider';
import { notificationApi } from '../services/api/notification.api';
import { chatSoundService } from '../services/audio/chatSound.service';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { showBanner } = useInAppBanner();
  const { register, unregister } = usePushRegistration();

  const authState = useAuthStore((s) => s.authState);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const permissionStatus = useNotificationStore((s) => s.permissionStatus);
  const setPermissionStatus = useNotificationStore((s) => s.setPermissionStatus);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const incrementUnread = useNotificationStore((s) => s.incrementUnread);

  const foregroundSubRef = useRef<Notifications.EventSubscription | null>(null);
  const responseSubRef = useRef<Notifications.EventSubscription | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // 1. Initial Cold Start Setup (Channels + Audio Preload + Initial Permission + Cold Start Tap Detection)
  useEffect(() => {
    // 1.0 Preload chat sound assets
    chatSoundService.ensurePreloaded();

    // 1.1 Apply Android notification channels & iOS categories
    pushService.registerNotificationChannels();

    // 1.2 Check initial permission state
    pushService.getPermissionStatus().then((status) => {
      setPermissionStatus(status);
    });

    // 1.3 Check for killed-app cold launch tap
    pushService.getLastNotificationResponse().then((response) => {
      if (response) {
        const rawData = response.notification?.request?.content?.data || {};
        const targetPath = resolveNotificationRoute(rawData as any);
        if (targetPath) {
          notificationQueue.enqueue(targetPath);
        }
      }
    });

    // 1.4 Initial Unread Count Hydration (Page 1)
    if (authState === 'AUTHENTICATED') {
      notificationApi.getNotifications(null, 1).then((res) => {
        if (res.meta.unread_count !== undefined) {
          setUnreadCount(res.meta.unread_count);
        }
      });
    }
  }, [authState, setPermissionStatus, setUnreadCount]);

  // 2. Auth State Sync (Login Register / Logout Cleanup)
  useEffect(() => {
    if (authState === 'AUTHENTICATED' && currentUserId) {
      register();
    } else if (authState === 'UNAUTHENTICATED') {
      unregister();
    }
  }, [authState, currentUserId, register, unregister]);

  // 3. Setup Foreground & Response Listeners
  useEffect(() => {
    // 3.1 Foreground Listener (App Open) -> Show In-App Banner & Increment Unread Badge
    foregroundSubRef.current = pushService.addForegroundListener((notification) => {
      const content = notification.request.content;
      const data = content.data || {};
      const title = content.title || 'Tasklync Update';
      const body = content.body || '';
      const category = (data.type || data.category || 'default') as string;

      incrementUnread();

      // Play receive sound if incoming event is a chat message
      if (category.includes('chat') || category.includes('message')) {
        chatSoundService.playReceiveSound(
          notification.request.identifier,
          data.sender_id || data.senderId,
          currentUserId
        );
      }

      showBanner({
        id: notification.request.identifier || `notif_${Date.now()}`,
        title,
        body,
        category,
        deepLink: (data.deep_link || data.deepLink) as string,
        data,
      });
    });

    // 3.2 Background/Tray Tap Listener -> Direct Immediate Navigation
    responseSubRef.current = pushService.addResponseListener((response) => {
      const rawData = response.notification?.request?.content?.data || {};
      const targetPath = resolveNotificationRoute(rawData as any);

      if (targetPath) {
        try {
          router.push(targetPath as any);
        } catch {
          router.push('/notifications' as any);
        }
      }
    });

    return () => {
      if (foregroundSubRef.current) {
        foregroundSubRef.current.remove();
        foregroundSubRef.current = null;
      }
      if (responseSubRef.current) {
        responseSubRef.current.remove();
        responseSubRef.current = null;
      }
    };
  }, [router, showBanner, incrementUnread]);

  // 4. AppState Foreground Listener (Self-healing & Permission Revocation Detection)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App returned to foreground: re-check permissions
        pushService.getPermissionStatus().then((status) => {
          setPermissionStatus(status);
          if (status === 'granted' && authState === 'AUTHENTICATED') {
            register();
          }
        });

        // Refresh unread counter
        if (authState === 'AUTHENTICATED') {
          notificationApi.getNotifications(null, 1).then((res) => {
            if (res.meta.unread_count !== undefined) {
              setUnreadCount(res.meta.unread_count);
            }
          });
        }
      }
      appStateRef.current = nextAppState;
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [authState, register, setPermissionStatus, setUnreadCount]);

  return <>{children}</>;
}
