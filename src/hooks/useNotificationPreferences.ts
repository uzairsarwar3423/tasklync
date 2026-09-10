import { useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createMMKV } from 'react-native-mmkv';
import { notificationApi } from '../services/api/notification.api';
import { NotificationPreferences, NotificationPrefKey } from '../types/settings.types';
import { CategoryPreference, NotificationCategory } from '../types/notification.types';

const storage = createMMKV({ id: 'tasklync_settings_storage' });
const PREFS_STORAGE_KEY = 'notification_preferences_cache';
const PREFS_QUERY_KEY = ['notification-preferences'];

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  push: {
    booking_updates: true,
    chat_messages: true,
    promotions: false,
  },
  sms: {
    booking_confirmations: true,
  },
};

function normalizeServerPreferences(rawList: CategoryPreference[]): NotificationPreferences {
  const map = new Map<string, CategoryPreference>(rawList.map((p) => [p.category, p]));

  const booking = map.get('booking');
  const chat = map.get('chat');
  const marketing = map.get('marketing');

  return {
    push: {
      booking_updates: booking?.push_enabled ?? true,
      chat_messages: chat?.push_enabled ?? true,
      promotions: marketing?.push_enabled ?? false,
    },
    sms: {
      booking_confirmations: booking?.sms_enabled ?? true,
    },
  };
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();
  const rawListRef = useRef<CategoryPreference[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial State from MMKV Cache
  const getCachedPreferences = (): NotificationPreferences => {
    try {
      const cached = storage.getString(PREFS_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (_e) {}
    return DEFAULT_NOTIFICATION_PREFS;
  };

  // 2. TanStack Query with background revalidation
  const { data: preferences = getCachedPreferences(), isLoading } = useQuery<NotificationPreferences>({
    queryKey: PREFS_QUERY_KEY,
    queryFn: async (): Promise<NotificationPreferences> => {
      try {
        const rawList = await notificationApi.getPreferences();
        if (Array.isArray(rawList) && rawList.length > 0) {
          rawListRef.current = rawList;
          const normalized = normalizeServerPreferences(rawList);
          storage.set(PREFS_STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        }
      } catch (_e) {}
      return getCachedPreferences();
    },
    initialData: getCachedPreferences,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Mutation for server sync
  const mutation = useMutation({
    mutationFn: async ({
      category,
      push_enabled,
      sms_enabled,
      email_enabled,
    }: {
      category: NotificationCategory;
      push_enabled: boolean;
      sms_enabled: boolean;
      email_enabled: boolean;
    }) => {
      return notificationApi.updatePreference({
        category,
        push_enabled,
        sms_enabled,
        email_enabled,
      });
    },
    onError: (_err, _variables, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(PREFS_QUERY_KEY, context.previous);
        storage.set(PREFS_STORAGE_KEY, JSON.stringify(context.previous));
      }
    },
  });

  // 4. Optimistic toggle handler
  const togglePreference = useCallback(
    (key: NotificationPrefKey) => {

      const current = queryClient.getQueryData<NotificationPreferences>(PREFS_QUERY_KEY) || preferences;
      let nextState: NotificationPreferences;
      let targetCategory: NotificationCategory = 'booking';
      let pushEnabled = true;
      let smsEnabled = true;
      let emailEnabled = false;

      const existingBooking = rawListRef.current.find((p) => p.category === 'booking');
      const existingChat = rawListRef.current.find((p) => p.category === 'chat');
      const existingMarketing = rawListRef.current.find((p) => p.category === 'marketing');

      if (key === 'push.booking_updates') {
        const nextVal = !current.push.booking_updates;
        nextState = { ...current, push: { ...current.push, booking_updates: nextVal } };
        targetCategory = 'booking';
        pushEnabled = nextVal;
        smsEnabled = existingBooking?.sms_enabled ?? current.sms.booking_confirmations;
        emailEnabled = existingBooking?.email_enabled ?? false;
      } else if (key === 'push.chat_messages') {
        const nextVal = !current.push.chat_messages;
        nextState = { ...current, push: { ...current.push, chat_messages: nextVal } };
        targetCategory = 'chat';
        pushEnabled = nextVal;
        smsEnabled = existingChat?.sms_enabled ?? false;
        emailEnabled = existingChat?.email_enabled ?? false;
      } else if (key === 'push.promotions') {
        const nextVal = !current.push.promotions;
        nextState = { ...current, push: { ...current.push, promotions: nextVal } };
        targetCategory = 'marketing';
        pushEnabled = nextVal;
        smsEnabled = existingMarketing?.sms_enabled ?? false;
        emailEnabled = existingMarketing?.email_enabled ?? false;
      } else {
        const nextVal = !current.sms.booking_confirmations;
        nextState = { ...current, sms: { ...current.sms, booking_confirmations: nextVal } };
        targetCategory = 'booking';
        pushEnabled = existingBooking?.push_enabled ?? current.push.booking_updates;
        smsEnabled = nextVal;
        emailEnabled = existingBooking?.email_enabled ?? false;
      }

      // Optimistic update in cache & state
      queryClient.setQueryData(PREFS_QUERY_KEY, nextState);
      storage.set(PREFS_STORAGE_KEY, JSON.stringify(nextState));

      // Debounce network request so rapid toggling only fires the final state
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        mutation.mutate({
          category: targetCategory,
          push_enabled: pushEnabled,
          sms_enabled: smsEnabled,
          email_enabled: emailEnabled,
        });
      }, 350);
    },
    [preferences, queryClient, mutation]
  );

  return {
    preferences,
    isLoading,
    togglePreference,
  };
}
