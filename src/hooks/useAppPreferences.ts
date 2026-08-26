import { useState, useCallback } from 'react';
import { createMMKV } from 'react-native-mmkv';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, getCachedUserProfile, setCachedUserProfile } from '../services/api/user.api';
import { LanguageCode, CurrencyCode } from '../types/settings.types';
import * as Haptics from 'expo-haptics';

const storage = createMMKV({ id: 'tasklync_app_preferences_storage' });
const LANGUAGE_KEY = 'app_language_pref';
const CURRENCY_KEY = 'app_currency_pref';

export function useAppPreferences() {
  const queryClient = useQueryClient();

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = storage.getString(LANGUAGE_KEY);
    return saved === 'ur' ? 'ur' : 'en';
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = storage.getString(CURRENCY_KEY);
    return saved === 'USD' ? 'USD' : 'PKR';
  });

  // Sync mutation to backend
  const updateBackendMutation = useMutation({
    mutationFn: async (payload: { preferred_language?: LanguageCode; preferred_currency?: CurrencyCode }) => {
      await userApi.updatePreferences(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
    },
  });

  const setLanguage = useCallback(
    (newLang: LanguageCode) => {
      Haptics.selectionAsync().catch(() => {});
      storage.set(LANGUAGE_KEY, newLang);
      setLanguageState(newLang);

      // Update cached profile
      const profile = getCachedUserProfile();
      if (profile) {
        setCachedUserProfile({ ...profile, preferred_language: newLang });
      }

      // Sync in background
      updateBackendMutation.mutate({ preferred_language: newLang });
    },
    [updateBackendMutation]
  );

  const setCurrency = useCallback(
    (newCurrency: CurrencyCode) => {
      Haptics.selectionAsync().catch(() => {});
      storage.set(CURRENCY_KEY, newCurrency);
      setCurrencyState(newCurrency);

      // Update cached profile
      const profile = getCachedUserProfile();
      if (profile) {
        setCachedUserProfile({ ...profile, preferred_currency: newCurrency });
      }

      // Sync in background
      updateBackendMutation.mutate({ preferred_currency: newCurrency });
    },
    [updateBackendMutation]
  );

  return {
    language,
    currency,
    setLanguage,
    setCurrency,
    isUpdating: updateBackendMutation.isPending,
  };
}
