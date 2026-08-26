import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { UserProfile } from '../types/user.types';

/**
 * profileCacheSync Utility (Day 35 Hard Problem #1)
 *
 * Single centralized fan-out invalidation utility for user profile & avatar updates.
 * Prevents drift between edit profile and avatar upload mutations by ensuring
 * all cached surfaces in the app refresh synchronously.
 */
export function invalidateProfileEverywhere(
  queryClient: QueryClient,
  updatedProfile?: Partial<UserProfile> | null
): void {
  // 1. Invalidate canonical user profile queries
  queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
  queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  queryClient.invalidateQueries({ queryKey: ['user-preferences'] });

  // 2. Invalidate chat & message sender bubbles
  queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
  queryClient.invalidateQueries({ queryKey: ['chat-messages'] });

  // 3. Invalidate booking list & active booking cards where customer details may be rendered
  queryClient.invalidateQueries({ queryKey: ['active-booking'] });
  queryClient.invalidateQueries({ queryKey: ['bookings-list'] });
  queryClient.invalidateQueries({ queryKey: ['bookings'] });

  // 4. Invalidate notification feeds
  queryClient.invalidateQueries({ queryKey: ['notifications'] });

  // 5. Synchronize Zustand auth store in-memory & MMKV snapshot
  if (updatedProfile) {
    const currentAuthUser = useAuthStore.getState().user;
    if (currentAuthUser) {
      useAuthStore.getState().setUser({
        ...currentAuthUser,
        ...(updatedProfile.name ? { name: updatedProfile.name } : {}),
        ...(updatedProfile.email !== undefined ? { email: updatedProfile.email } : {}),
        ...(updatedProfile.avatar_url !== undefined ? { avatar_url: updatedProfile.avatar_url } : {}),
      });
    }
  }
}
