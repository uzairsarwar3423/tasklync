import { useCallback } from 'react';
import { useNotificationStore } from '../store/notification.store';
import { pushService } from '../services/notifications/push.service';
import { NotificationPermissionStatus } from '../types/notification.types';

export function useNotificationPermission() {
  const permissionStatus = useNotificationStore((s) => s.permissionStatus);
  const setPermissionStatus = useNotificationStore((s) => s.setPermissionStatus);

  const check = useCallback(async (): Promise<NotificationPermissionStatus> => {
    const status = await pushService.getPermissionStatus();
    setPermissionStatus(status);
    return status;
  }, [setPermissionStatus]);

  const request = useCallback(async (): Promise<NotificationPermissionStatus> => {
    const status = await pushService.requestPermission();
    setPermissionStatus(status);
    return status;
  }, [setPermissionStatus]);

  return {
    status: permissionStatus,
    isGranted: permissionStatus === 'granted',
    isDenied: permissionStatus === 'denied',
    isUndetermined: permissionStatus === 'undetermined',
    check,
    request,
  };
}
