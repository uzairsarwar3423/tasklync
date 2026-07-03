import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, CheckCircle2 } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { Screen } from '@components/layout/Screen';
import { StickyFooter } from '@components/layout/StickyFooter';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { colors, fontFamily, radius } from '@design/index';
import { useLocationStore, useUIStore, useAuthStore } from '@store/index';

const FEATURES = [
  'Find verified workers closest to you',
  'Track workers in real-time as they travel',
  'Get accurate arrival time estimates',
];

export default function LocationPermissionScreen() {
  const router = useRouter();
  const setPermissionStatus = useLocationStore(state => state.setPermissionStatus);
  const showToast = useUIStore(state => state.showToast);
  const user = useAuthStore(state => state.user);

  const handleAllow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
      
      if (status === 'granted') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Optionally get position and reverse geocode here...
      }

      router.replace('/(tabs)/' as any);
      
      if (status === 'granted') {
        showToast({ type: 'success', title: `Welcome, ${user?.name || 'there'}! 👋` });
      }
    } catch (e) {
      // If error occurs, still proceed, don't block
      setPermissionStatus('undetermined');
      router.replace('/(tabs)/' as any);
    }
  };

  const handleNotNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPermissionStatus('denied');
    router.replace('/(tabs)/' as any);
  };

  return (
    <Screen bg="#FAFAFA" statusBarStyle="dark-content">
      <View style={styles.content}>
        <View style={styles.animationPlaceholder} accessibilityLabel="Animated map showing location feature">
          <MapPin size={80} color={colors.primary} />
        </View>

        <Text variant="h1" color="primary" align="center" style={styles.title}>
          Enable location{'\n'}access
        </Text>

        <Text variant="body1" color="muted" align="center" style={styles.subtitle}>
          We use your location to find the best workers near you
        </Text>

        <View style={styles.featureList}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <CheckCircle2 size={20} color={colors.primary} style={styles.featureIcon} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      <StickyFooter>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleAllow}
          style={styles.allowButton}
          label="Allow Location"
        />
        <Pressable 
          onPress={handleNotNow}
          hitSlop={12}
          style={styles.notNowButton}
          accessibilityLabel="Skip location access for now"
        >
          <Text style={styles.notNowText}>Not now</Text>
        </Pressable>
      </StickyFooter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  animationPlaceholder: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 28,
  },
  featureList: {
    width: '100%',
    backgroundColor: colors.bgCard,
    padding: 16,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  allowButton: {
    marginBottom: 10,
  },
  notNowButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  notNowText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
