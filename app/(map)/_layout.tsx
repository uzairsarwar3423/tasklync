import { Stack } from 'expo-router';

export default function MapLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAFAFA' } }}>
      <Stack.Screen name="live-map" options={{ animation: 'slide_from_bottom', gestureEnabled: true }} />
    </Stack>
  );
}
