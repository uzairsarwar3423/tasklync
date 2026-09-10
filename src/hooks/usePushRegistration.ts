import { useCallback, useRef } from 'react';
import { useNotificationStore } from '../store/notification.store';
import { useAuthStore } from '../store/auth.store';
import { pushService } from '../services/notifications/push.service';
import { notificationApi } from '../services/api/notification.api';

export function usePushRegistration() {
  const pushToken = useNotificationStore((s) => s.pushToken);
  const tokenRegisteredForUserId = useNotificationStore((s) => s.tokenRegisteredForUserId);
  const setPushToken = useNotificationStore((s) => s.setPushToken);
  const setTokenRegisteredForUser = useNotificationStore((s) => s.setTokenRegisteredForUser);
  const setLastRegistrationError = useNotificationStore((s) => s.setLastRegistrationError);
  const setPermissionStatus = useNotificationStore((s) => s.setPermissionStatus);
  const setCanAskAgain = useNotificationStore((s) => s.setCanAskAgain);

  const isRegisteringRef = useRef<boolean>(false);

  /**
   * Idempotent push token registration with backend.
   */
  const register = useCallback(async (): Promise<boolean> => {
    const currentUserId = useAuthStore.getState().user?.id;
    if (!currentUserId) return false;

    // 1. Idempotency check: Already registered for current active user session
    if (pushToken && tokenRegisteredForUserId === currentUserId) {
      return true;
    }

    if (isRegisteringRef.current) return false;
    isRegisteringRef.current = true;

    try {
      // 2. Check and ensure permissions safely
      const detail = await pushService.getDetailedPermissionStatus();
      let permStatus = detail.status;

      if (permStatus === 'undetermined') {
        permStatus = await pushService.requestPermission();
        const updatedDetail = await pushService.getDetailedPermissionStatus();
        setCanAskAgain(updatedDetail.canAskAgain);
      } else {
        setCanAskAgain(detail.canAskAgain);
      }

      setPermissionStatus(permStatus);

      if (permStatus !== 'granted') {
        isRegisteringRef.current = false;
        return false;
      }

      // 3. Obtain Firebase FCM / APNs / Expo push token
      const token = await pushService.getPushToken();
      if (!token) {
        setLastRegistrationError('Failed to generate push token on device');
        isRegisteringRef.current = false;
        return false;
      }

      setPushToken(token);

      // 4. Sync with Backend User Service (POST /users/me/fcm-token)
      const success = await notificationApi.registerPushToken(token);
      if (success) {
        setTokenRegisteredForUser(currentUserId);
        setLastRegistrationError(null);
        isRegisteringRef.current = false;
        return true;
      } else {
        setLastRegistrationError('Backend token sync failed');
        isRegisteringRef.current = false;
        return false;
      }
    } catch (err: any) {
      setLastRegistrationError(err?.message || 'Push registration error');
      isRegisteringRef.current = false;
      return false;
    }
  }, [
    pushToken,
    tokenRegisteredForUserId,
    setPushToken,
    setTokenRegisteredForUser,
    setLastRegistrationError,
    setPermissionStatus,
    setCanAskAgain,
  ]);

  /**
   * Unregisters push token on user logout.
   */
  const unregister = useCallback(async (): Promise<void> => {
    try {
      await notificationApi.unregisterPushToken();
    } catch {
      // Best-effort cleanup
    } finally {
      setPushToken(null);
      setTokenRegisteredForUser(null);
      setLastRegistrationError(null);
    }
  }, [setPushToken, setTokenRegisteredForUser, setLastRegistrationError]);

  return {
    register,
    unregister,
  };
}
