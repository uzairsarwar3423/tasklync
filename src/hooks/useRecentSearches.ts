import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

// We can instantiate or reuse an existing instance
// Fallback for Web to prevent crash
const storage = Platform.OS === 'web' 
  ? { 
      getString: () => null, 
      set: () => {}, 
      remove: () => {} 
    } 
  : createMMKV();
const STORAGE_KEY = 'user:recent_searches';
const MAX_SEARCHES = 8;

export const useRecentSearches = () => {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = storage.getString(STORAGE_KEY);
    if (stored) {
      try {
        setSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);


  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    setSearches((prev) => {
      // Remove if exists
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      // Prepend
      const updated = [trimmed, ...filtered].slice(0, MAX_SEARCHES);
      storage.set(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setSearches((prev) => {
      const updated = prev.filter((s) => s !== query);
      storage.set(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    storage.remove(STORAGE_KEY);
    setSearches([]);
  }, []);

  return {
    searches,
    addSearch,
    removeSearch,
    clearAll,
    hasSearches: searches.length > 0,
  };
};
