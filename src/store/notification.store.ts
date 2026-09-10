import { create } from 'zustand';
import { NotificationPermissionStatus } from '../types/notification.types';

interface NotificationState {
  permissionStatus: NotificationPermissionStatus;
  canAskAgain: boolean;
  pushToken: string | null;
  tokenRegisteredForUserId: string | null;
  lastRegistrationError: string | null;
  unreadCount: number;

  setPermissionStatus: (status: NotificationPermissionStatus) => void;
  setCanAskAgain: (canAskAgain: boolean) => void;
  setPushToken: (token: string | null) => void;
  setTokenRegisteredForUser: (userId: string | null) => void;
  setLastRegistrationError: (error: string | null) => void;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  permissionStatus: 'undetermined',
  canAskAgain: true,
  pushToken: null,
  tokenRegisteredForUserId: null,
  lastRegistrationError: null,
  unreadCount: 0,

  setPermissionStatus: (permissionStatus) => set({ permissionStatus }),
  setCanAskAgain: (canAskAgain) => set({ canAskAgain }),
  setPushToken: (pushToken) => set({ pushToken }),
  setTokenRegisteredForUser: (tokenRegisteredForUserId) => set({ tokenRegisteredForUserId }),
  setLastRegistrationError: (lastRegistrationError) => set({ lastRegistrationError }),
  setUnreadCount: (unreadCount) => set({ unreadCount: Math.max(0, unreadCount) }),
  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  clearUnread: () => set({ unreadCount: 0 }),
  reset: () =>
    set({
      permissionStatus: 'undetermined',
      canAskAgain: true,
      pushToken: null,
      tokenRegisteredForUserId: null,
      lastRegistrationError: null,
      unreadCount: 0,
    }),
}));
