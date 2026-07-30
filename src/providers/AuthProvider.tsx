import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore, useLocationStore } from '../store';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const segments = useSegments();
  const authState = useAuthStore(state => state.authState);
  const hydrateAuth = useAuthStore(state => state.hydrate);
  const hydrateLocation = useLocationStore(state => state.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateLocation();
  }, [hydrateAuth, hydrateLocation]);

  useEffect(() => {
    if (authState === 'idle' || authState === 'loading') return;

    const inAuthGroup = segments[0] === '(auth)';
    const authScreen = segments[1];

    if (authState === 'unauthenticated' && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/welcome');
    } else if (authState === 'authenticated') {
      // Wait for OTP success animation to finish before redirecting (handled in useAuth)
      if (authScreen === 'otp') return;

      const user = useAuthStore.getState().user;
      const isNewUser = useAuthStore.getState().isNewUser;
      const hasValidName = user?.name && user.name !== 'null' && user.name !== '' && user.name !== 'New User';
      const needsProfileSetup = isNewUser || !hasValidName;

      if (inAuthGroup) {
        // Allow user to stay on setup screens
        if (authScreen === 'name' || authScreen === 'location-permission') {
          return;
        }

        // Redirect away from login screens (welcome, phone)
        if (needsProfileSetup) {
          router.replace('/(auth)/name');
        } else {
          router.replace('/(tabs)' as any);
        }
      } else {
        // If they somehow got to tabs without setting up their profile, force them back
        if (needsProfileSetup) {
          router.replace('/(auth)/name');
        }
      }
    }
  }, [authState, segments, router]);

  return <>{children}</>;
};
