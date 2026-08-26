import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
  Platform,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Crosshair, MapPinOff, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, palette, fontFamily, radius, shadows, fontSize } from '../../design';

export interface UseMyLocationButtonProps {
  onLocationFound: (coords: { lat: number; lng: number }) => void;
  fetchLocation: () => Promise<{ lat: number; lng: number } | null>;
  isFetching?: boolean;
}

export const UseMyLocationButton: React.FC<UseMyLocationButtonProps> = ({
  onLocationFound,
  fetchLocation,
  isFetching = false,
}) => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const shakeOffset = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }, { scale: scale.value }],
  }));

  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shakeOffset.value = withSequence(
      withTiming(-6, { duration: 35 }),
      withTiming(6, { duration: 35 }),
      withTiming(-4, { duration: 35 }),
      withTiming(4, { duration: 35 }),
      withTiming(0, { duration: 35 })
    );
  };

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1.0, { damping: 12, stiffness: 300 })
    );

    const coords = await fetchLocation();
    if (coords) {
      onLocationFound(coords);
    } else {
      triggerShake();
      setShowPermissionModal(true);
    }
  };

  const openSystemSettings = () => {
    setShowPermissionModal(false);
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <>
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <Pressable
          onPress={handlePress}
          disabled={isFetching}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Use my current GPS location"
          accessibilityHint="Centers the map on your physical location"
        >
          {isFetching ? (
            <ActivityIndicator size="small" color={colors.primaryDark} />
          ) : (
            <Crosshair size={22} color={colors.primaryDark} strokeWidth={2.4} />
          )}
        </Pressable>
      </Animated.View>

      {/* Permission Denied Explainer Modal */}
      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <MapPinOff size={24} color={palette.danger} strokeWidth={2.2} />
              </View>
              <Pressable
                onPress={() => setShowPermissionModal(false)}
                style={styles.closeBtn}
                accessibilityLabel="Close"
              >
                <X size={20} color={palette.gray500} />
              </Pressable>
            </View>

            <Text style={styles.modalTitle} maxFontSizeMultiplier={1.3}>
              Location Access Needed
            </Text>
            <Text style={styles.modalDescription} maxFontSizeMultiplier={1.3}>
              To automatically place the pin at your current doorstep, please enable location permissions in Settings.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowPermissionModal(false)}
                style={styles.cancelBtn}
                accessibilityRole="button"
              >
                <Text style={styles.cancelBtnText} maxFontSizeMultiplier={1.3}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={openSystemSettings}
                style={styles.settingsBtn}
                accessibilityRole="button"
              >
                <Text style={styles.settingsBtnText} maxFontSizeMultiplier={1.3}>
                  Open Settings
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.circle,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: palette.gray50,
    transform: [{ scale: 0.95 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 20,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h3,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalDescription: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body2,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.iceGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 14,
    color: palette.gray700,
  },
  settingsBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 14,
    color: palette.white,
  },
});
