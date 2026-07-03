import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import { AuthUser } from '../types/auth.types';

const storage = createMMKV();

export type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthStoreState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  authState: AuthState;
  isNewUser: boolean;
  
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  setIsNewUser: (isNewUser: boolean) => void;
  hydrate: () => void;
  logout: () => void;
  setAuthState: (state: AuthState) => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  authState: 'idle',
  isNewUser: false,
  
  get isAuthenticated() {
    return get().authState === 'authenticated';
  },
  
  get isLoading() {
    const state = get().authState;
    return state === 'loading' || state === 'idle';
  },
  
  setTokens: (accessToken, refreshToken) => {
    storage.set('accessToken', accessToken);
    storage.set('refreshToken', refreshToken);
    set({ accessToken, refreshToken, authState: 'authenticated' });
  },
  
  setUser: (user) => {
    storage.set('user', JSON.stringify(user));
    set({ user });
  },
  
  setIsNewUser: (isNewUser) => {
    set({ isNewUser });
  },
  
  setAuthState: (state) => {
    set({ authState: state });
  },

  hydrate: () => {
    set({ authState: 'loading' });
    const accessToken = storage.getString('accessToken');
    const refreshToken = storage.getString('refreshToken');
    const userStr = storage.getString('user');
    
    if (accessToken && refreshToken) {
      let user = null;
      try {
        if (userStr) user = JSON.parse(userStr);
      } catch (e) {}
      
      set({ 
        accessToken, 
        refreshToken, 
        user,
        // we keep state as loading to allow validateToken (auth/me) to run, but in Day 3 plan
        // hydrate either validates or we assume authenticated until validation fails.
        // Let's set it to authenticated here for immediate UI hydration, and let the API logic handle token refresh failure
        authState: 'authenticated' 
      });
    } else {
      set({ authState: 'unauthenticated' });
    }
  },
  
  logout: () => {
    storage.remove('accessToken');
    storage.remove('refreshToken');
    storage.remove('user');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isNewUser: false,
      authState: 'unauthenticated',
    });
  },
}));
