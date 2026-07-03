import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="welcome" 
        options={{ animation: 'none', gestureEnabled: false }} 
      />
      <Stack.Screen 
        name="phone" 
        options={{ animation: 'slide_from_right', gestureEnabled: true }} 
      />
      <Stack.Screen 
        name="otp" 
        options={{ animation: 'slide_from_right', gestureEnabled: true }} 
      />
      <Stack.Screen 
        name="name" 
        options={{ animation: 'fade', gestureEnabled: false }} 
      />
      <Stack.Screen 
        name="location-permission" 
        options={{ animation: 'fade', gestureEnabled: false }} 
      />
    </Stack>
  );
}
