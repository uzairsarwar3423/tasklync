import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'tasklync_chat_unread_store' });
const UNREAD_COUNT_KEY = 'chat_total_unread_count';
const UNREAD_MAP_KEY = 'chat_unread_by_booking_map';

function getInitialCount(): number {
  try {
    return storage.getNumber(UNREAD_COUNT_KEY) || 0;
  } catch {
    return 0;
  }
}

function getInitialMap(): Record<string, number> {
  try {
    const raw = storage.getString(UNREAD_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

interface ChatUnreadState {
  unreadCount: number;
  unreadByBooking: Record<string, number>;
  setUnreadCount: (count: number) => void;
  setBookingUnread: (bookingId: string, count: number) => void;
  incrementUnread: (bookingId: string) => void;
  clearBookingUnread: (bookingId: string) => void;
  clearAll: () => void;
}

export const useChatUnreadStore = create<ChatUnreadState>((set, get) => ({
  unreadCount: getInitialCount(),
  unreadByBooking: getInitialMap(),

  setUnreadCount: (count: number) => {
    const validCount = Math.max(0, count);
    try {
      storage.set(UNREAD_COUNT_KEY, validCount);
    } catch {
      // MMKV safe fallback
    }
    set({ unreadCount: validCount });
  },

  setBookingUnread: (bookingId: string, count: number) => {
    const validCount = Math.max(0, count);
    const prevMap = get().unreadByBooking;
    const nextMap = { ...prevMap, [bookingId]: validCount };

    // Calculate sum of all bookings
    const total = Object.values(nextMap).reduce((sum, n) => sum + (n || 0), 0);

    try {
      storage.set(UNREAD_MAP_KEY, JSON.stringify(nextMap));
      storage.set(UNREAD_COUNT_KEY, total);
    } catch {
      // MMKV safe fallback
    }

    set({ unreadByBooking: nextMap, unreadCount: total });
  },

  incrementUnread: (bookingId: string) => {
    const prevMap = get().unreadByBooking;
    const current = prevMap[bookingId] || 0;
    const nextMap = { ...prevMap, [bookingId]: current + 1 };
    const total = Object.values(nextMap).reduce((sum, n) => sum + (n || 0), 0);

    try {
      storage.set(UNREAD_MAP_KEY, JSON.stringify(nextMap));
      storage.set(UNREAD_COUNT_KEY, total);
    } catch {
      // MMKV safe fallback
    }

    set({ unreadByBooking: nextMap, unreadCount: total });
  },

  clearBookingUnread: (bookingId: string) => {
    const prevMap = get().unreadByBooking;
    if (!prevMap[bookingId] || prevMap[bookingId] === 0) return;

    const nextMap = { ...prevMap, [bookingId]: 0 };
    const total = Object.values(nextMap).reduce((sum, n) => sum + (n || 0), 0);

    try {
      storage.set(UNREAD_MAP_KEY, JSON.stringify(nextMap));
      storage.set(UNREAD_COUNT_KEY, total);
    } catch {
      // MMKV safe fallback
    }

    set({ unreadByBooking: nextMap, unreadCount: total });
  },

  clearAll: () => {
    try {
      storage.set(UNREAD_MAP_KEY, JSON.stringify({}));
      storage.set(UNREAD_COUNT_KEY, 0);
    } catch {
      // MMKV safe fallback
    }
    set({ unreadCount: 0, unreadByBooking: {} });
  },
}));
