import { Stack } from 'expo-router';
import { colors } from '../../src/design/colors';

export default function MapLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgApp } }}>
      <Stack.Screen name="live-map" options={{ animation: 'slide_from_bottom', gestureEnabled: true }} />
    </Stack>
  );
}
