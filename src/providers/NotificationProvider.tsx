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
  const setPermissionStatus = useNotificationStore((s) => s.setPermissionStatus);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const incrementUnread = useNotificationStore((s) => s.incrementUnread);

  const foregroundSubRef = useRef<Notifications.EventSubscription | null>(null);
  const responseSubRef = useRef<Notifications.EventSubscription | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // 1. Initial Cold Start Setup (Channels + Initial Permission + Cold Start Tap Detection)
  useEffect(() => {
    // 1.1 Apply Android notification channels & iOS categories asynchronously
    pushService.registerNotificationChannels().catch(() => {});

    // 1.2 Check initial permission state
    pushService
      .getPermissionStatus()
      .then((status) => {
        setPermissionStatus(status);
      })
      .catch(() => {});

    // 1.3 Check for killed-app cold launch tap
    pushService
      .getLastNotificationResponse()
      .then((response) => {
        if (response) {
          const rawData = response.notification?.request?.content?.data || {};
          const targetPath = resolveNotificationRoute(rawData as any);
          if (targetPath) {
            notificationQueue.enqueue(targetPath);
          }
        }
      })
      .catch(() => {});

    // 1.4 Initial Unread Count Hydration (Page 1)
    if (authState === 'authenticated') {
      notificationApi
        .getNotifications(null, 1)
        .then((res) => {
          if (res?.meta?.unread_count !== undefined) {
            setUnreadCount(res.meta.unread_count);
          }
        })
        .catch(() => {});
    }
  }, [authState, setPermissionStatus, setUnreadCount]);

  // 2. Auth State Sync (Login Register / Logout Cleanup)
  useEffect(() => {
    if (authState === 'authenticated' && currentUserId) {
      register().catch(() => {});
    } else if (authState === 'unauthenticated') {
      unregister().catch(() => {});
    }
  }, [authState, currentUserId, register, unregister]);

  // 3. Setup Foreground & Response Listeners
  useEffect(() => {
    // 3.1 Foreground Listener (App Open) -> Show In-App Banner & Increment Unread Badge
    foregroundSubRef.current = pushService.addForegroundListener((notification) => {
      try {
        const content = notification?.request?.content;
        if (!content) return;
        const data = (content.data || {}) as Record<string, any>;
        const title = content.title || 'Tasklync Update';
        const body = content.body || '';
        const category = String(data.type || data.category || 'default');

        incrementUnread();

        // Play receive sound if incoming event is a chat message
        if (category.includes('chat') || category.includes('message')) {
          const senderId = (data.sender_id || data.senderId) ? String(data.sender_id || data.senderId) : undefined;
          const messageId = String(data.message_id || data.messageId || data.id || notification.request.identifier || '');
          chatSoundService
            .playReceiveSound(
              messageId,
              senderId,
              currentUserId
            )
            .catch(() => {});
        }

        showBanner({
          id: notification.request.identifier || `notif_${Date.now()}`,
          title,
          body,
          category,
          deepLink: (data.deep_link || data.deepLink) ? String(data.deep_link || data.deepLink) : undefined,
          data,
        });
      } catch (e) {
        if (__DEV__) {
          console.warn('[NotificationProvider] Error in foreground listener:', e);
        }
      }
    });

    // 3.2 Background/Tray Tap Listener -> Direct Immediate Navigation
    responseSubRef.current = pushService.addResponseListener((response) => {
      try {
        const rawData = response?.notification?.request?.content?.data || {};
        const targetPath = resolveNotificationRoute(rawData as any);

        if (targetPath) {
          try {
            router.push(targetPath as any);
          } catch {
            router.push('/notifications' as any);
          }
        }
      } catch (e) {
        if (__DEV__) {
          console.warn('[NotificationProvider] Error handling notification response:', e);
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
  }, [router, showBanner, incrementUnread, currentUserId]);

  // 4. AppState Foreground Listener (Self-healing & Permission Revocation Detection)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App returned to foreground: re-check permissions
        pushService
          .getPermissionStatus()
          .then((status) => {
            setPermissionStatus(status);
            if (status === 'granted' && authState === 'authenticated') {
              register().catch(() => {});
            }
          })
          .catch(() => {});

        // Refresh unread counter
        if (authState === 'authenticated') {
          notificationApi
            .getNotifications(null, 1)
            .then((res) => {
              if (res?.meta?.unread_count !== undefined) {
                setUnreadCount(res.meta.unread_count);
              }
            })
            .catch(() => {});
        }
      }
      appStateRef.current = nextAppState;
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [authState, register, setPermissionStatus, setUnreadCount]);

  return <>{children}</>;
}
