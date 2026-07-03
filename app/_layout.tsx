import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { fontAssets } from '@config/fonts';
import { queryClient } from '@config/queryClient';
import { AppProviders } from '@providers/AppProviders';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppProviders>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade', gestureEnabled: false }} />
              <Stack.Screen name="(map)/live-map" options={{ animation: 'slide_from_bottom', gestureEnabled: true }} />
              <Stack.Screen name="worker/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="booking/[id]/chat" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="booking/success" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
              <Stack.Screen name="booking/[id]/track" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
          </AppProviders>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
