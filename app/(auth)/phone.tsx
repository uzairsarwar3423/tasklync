import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, ChevronLeft } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { Screen } from '@components/layout/Screen';
import { StickyFooter } from '@components/layout/StickyFooter';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/Button';
import { PhoneInput } from '@components/ui/Input/PhoneInput';
import { IconButton } from '@components/ui/Button/IconButton';
import { colors, fontFamily } from '@design/index';
import { useSendOtp } from '@hooks/useAuth';
import * as Haptics from 'expo-haptics';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const { sendOtp, isLoading, error } = useSendOtp();

  const isValid = phone.length >= 10;
  
  // Animation for valid state
  const buttonScale = useSharedValue(1);
  const buttonColor = useSharedValue(colors.primaryLight); // #86EFAC

  useEffect(() => {
    if (isValid) {
      Haptics.selectionAsync();
      buttonScale.value = withSpring(1.03, { damping: 10, stiffness: 400 }, (finished) => {
        if (finished) {
          buttonScale.value = withSpring(1);
        }
      });
      buttonColor.value = withTiming(colors.primary, { duration: 200 });
    } else {
      buttonColor.value = withTiming(colors.primaryLight, { duration: 200 });
    }
  }, [isValid]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleContinue = () => {
    if (isValid && !isLoading) {
      sendOtp(phone);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <Screen bg={colors.bgCard} statusBarStyle="dark-content">
      <View style={styles.header}>
        <IconButton
          icon={ChevronLeft}
          iconSize={24}
          color={colors.textPrimary}
          onPress={handleGoBack}
          accessibilityLabel="Go back to welcome screen"
          bg="transparent"
          style={styles.backButton}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Phone size={28} color={colors.primary} />
        </View>

        <Text variant="h1" color="primary" style={styles.title}>
          Enter your{'\n'}phone number
        </Text>

        <Text variant="body1" color="muted" style={styles.subtitle}>
          We'll send a verification code to confirm it's you
        </Text>

        <View style={styles.inputContainer}>
          <PhoneInput
            value={phone}
            onChangeText={setPhone}
            error={error ?? ''}
            onSubmitEditing={handleContinue}
          />
        </View>

        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text style={styles.legalLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </View>

      <StickyFooter>
        <Animated.View style={animatedButtonStyle}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isValid}
            loading={isLoading}
            onPress={handleContinue}
            style={{ backgroundColor: isValid ? colors.primary : colors.primaryLight }}
            label="Continue"
          />
        </Animated.View>
      </StickyFooter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  legalText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  legalLink: {
    color: colors.primary,
  },
});
