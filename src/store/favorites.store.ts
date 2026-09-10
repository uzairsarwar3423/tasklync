import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();
const FAVORITES_STORAGE_KEY = 'tasklync_favorite_workers';

interface FavoritesState {
  favorites: Record<string, boolean>;
  isFavorite: (workerId: string) => boolean;
  toggleFavorite: (workerId: string) => boolean;
  hydrate: () => void;
}

const loadPersistedFavorites = (): Record<string, boolean> => {
  try {
    const raw = storage.getString(FAVORITES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[FavoritesStore] Error loading persisted favorites:', e);
  }
  return {};
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: loadPersistedFavorites(),

  isFavorite: (workerId: string) => {
    return !!get().favorites[workerId];
  },

  toggleFavorite: (workerId: string) => {
    const current = get().favorites;
    const nextState = !current[workerId];
    const updated = { ...current, [workerId]: nextState };

    if (!nextState) {
      delete updated[workerId];
    }

    try {
      storage.set(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[FavoritesStore] Error persisting favorites:', e);
    }

    set({ favorites: updated });
    return nextState;
  },

  hydrate: () => {
    set({ favorites: loadPersistedFavorites() });
  },
}));
