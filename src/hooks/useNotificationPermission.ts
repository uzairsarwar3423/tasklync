import { useCallback } from 'react';
import { useNotificationStore } from '../store/notification.store';
import { pushService } from '../services/notifications/push.service';
import { NotificationPermissionStatus } from '../types/notification.types';

export function useNotificationPermission() {
  const permissionStatus = useNotificationStore((s) => s.permissionStatus);
  const canAskAgain = useNotificationStore((s) => s.canAskAgain);
  const setPermissionStatus = useNotificationStore((s) => s.setPermissionStatus);
  const setCanAskAgain = useNotificationStore((s) => s.setCanAskAgain);

  const check = useCallback(async (): Promise<NotificationPermissionStatus> => {
    const detail = await pushService.getDetailedPermissionStatus();
    setPermissionStatus(detail.status);
    setCanAskAgain(detail.canAskAgain);
    return detail.status;
  }, [setPermissionStatus, setCanAskAgain]);

  const request = useCallback(async (): Promise<NotificationPermissionStatus> => {
    const status = await pushService.requestPermission();
    const detail = await pushService.getDetailedPermissionStatus();
    setPermissionStatus(status);
    setCanAskAgain(detail.canAskAgain);
    return status;
  }, [setPermissionStatus, setCanAskAgain]);

  return {
    status: permissionStatus,
    canAskAgain,
    isGranted: permissionStatus === 'granted',
    isDenied: permissionStatus === 'denied',
    isUndetermined: permissionStatus === 'undetermined',
    check,
    request,
  };
}
