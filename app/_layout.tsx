import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { fontAssets } from '@config/fonts';
import { queryClient } from '@config/queryClient';
import { AppProviders } from '@providers/AppProviders';
import { notificationQueue } from '../src/services/notifications/notification-queue';

import { FloatingCartBar } from '../src/components/cart/FloatingCartBar';
import { ConnectionBanner } from '../src/components/feedback/ConnectionBanner';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});

      // Flush any queued cold-start notification navigation once router is ready
      notificationQueue.flush((path) => {
        try {
          router.push(path as any);
        } catch {
          try {
            router.push('/notifications' as any);
          } catch {}
        }
      });
    }
  }, [fontsLoaded, fontError, router]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppProviders>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
              <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade', gestureEnabled: false }} />
              <Stack.Screen name="(map)" options={{ animation: 'slide_from_bottom', gestureEnabled: true }} />
              <Stack.Screen name="cart/index" options={{ animation: 'slide_from_bottom', gestureEnabled: true }} />
              <Stack.Screen
                name="worker/[id]"
                options={{
                  animation: 'slide_from_right',
                  presentation: 'card',
                  contentStyle: { backgroundColor: '#FFFFFF' },
                  fullScreenGestureEnabled: true,
                }}
              />
              <Stack.Screen name="booking/schedule" options={{ animation: 'slide_from_right', gestureEnabled: true }} />
              <Stack.Screen name="booking/address" options={{ animation: 'slide_from_right', gestureEnabled: true }} />
              <Stack.Screen name="booking/summary" options={{ animation: 'slide_from_right', gestureEnabled: true }} />
              <Stack.Screen name="booking/payment" options={{ animation: 'slide_from_right', gestureEnabled: true }} />
              <Stack.Screen name="booking/[id]/chat" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="booking/success" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
              <Stack.Screen name="booking/[id]/track" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="notifications/index" options={{ animation: 'slide_from_right', gestureEnabled: true }} />
              <Stack.Screen name="notifications/preferences" options={{ animation: 'slide_from_right', gestureEnabled: true }} />
              <Stack.Screen name="search/filters" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            </Stack>
            <FloatingCartBar />
            <ConnectionBanner />
          </AppProviders>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
