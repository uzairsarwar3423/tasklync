import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageSquare, ChevronLeft } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Screen } from '@components/layout/Screen';
import { Text } from '@components/ui/Text';
import { OTPInput } from '@components/ui/Input/OTPInput';
import { IconButton } from '@components/ui/Button/IconButton';
import { colors, fontFamily } from '@design/index';
import { useVerifyOtp, useSendOtp } from '@hooks/useAuth';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const { verifyOtp, isLoading, error, otpError } = useVerifyOtp();
  const { sendOtp } = useSendOtp();

  // Handle countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleComplete = async (code: string) => {
    // If verifyOtp completes without error, it handles navigation
    // but we can set success state by checking if there's no error after await?
    // Actually hook handles success but we need to pass success prop to OTPInput
    // To make it simple, we can intercept or let hook trigger success.
    // The spec says OTP cascade is triggered when OTPInput receives success=true.
    // For now we'll trigger it right away on mock, but ideally the hook should return success.
    try {
      await verifyOtp(phone || '', code);
      // If we are here, it means success.
      setSuccessState(true);
    } catch (e) {
      // handled by hook
    }
  };

  const handleResend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phone) {
      sendOtp(phone);
    }
    setTimeLeft(60);
    setCanResend(false);
    setOtp('');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/phone');
    }
  };

  const formattedPhone = phone ? `+92 3XX XXX••${phone.slice(-2)}` : '';
  const timeDisplay = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

  const countdownStyle = useAnimatedStyle(() => ({
    opacity: withTiming(canResend ? 0 : 1, { duration: 250 }),
  }));

  const resendStyle = useAnimatedStyle(() => ({
    opacity: withTiming(canResend ? 1 : 0, { duration: 250 }),
    position: canResend ? 'relative' : 'absolute',
  }));

  return (
    <Screen bg={colors.bgCard} statusBarStyle="dark-content">
      <View style={styles.header}>
        <IconButton
          icon={ChevronLeft}
          iconSize={24}
          color={colors.textPrimary}
          onPress={handleGoBack}
          accessibilityLabel="Go back and change phone number"
          bg="transparent"
          style={styles.backButton}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MessageSquare size={28} color={colors.primary} />
        </View>

        <Text variant="h1" color="primary" style={styles.title}>
          Verify your number
        </Text>

        <Text style={styles.maskedPhoneContainer}>
          <Text style={styles.maskedPhonePrefix}>Code sent to </Text>
          <Text style={styles.maskedPhone}>{formattedPhone}</Text>
        </Text>

        <View style={styles.otpContainer}>
          <OTPInput
            value={otp}
            onChange={setOtp}
            onComplete={handleComplete}
            error={otpError}
            success={successState}
            disabled={isLoading || successState}
          />
        </View>

        {/* Error message if expired/too many attempts, handled by toast or custom Text */}
        {error && !otpError && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.countdownSection} accessibilityLiveRegion="polite">
          <Animated.View style={[styles.countdownContainer, countdownStyle]}>
            <Text style={styles.countdownText}>Resend code in </Text>
            <Text style={styles.timeText}>{timeDisplay}</Text>
          </Animated.View>

          <Animated.View style={[styles.resendContainer, resendStyle]}>
            <Pressable onPress={handleResend} disabled={!canResend} hitSlop={12} accessibilityRole="button">
              <Text style={styles.resendText}>Resend code</Text>
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.wrongNumberContainer}>
          <Text style={styles.wrongNumberPrefix}>Wrong number? </Text>
          <Pressable onPress={handleGoBack} hitSlop={8} accessibilityRole="link">
            <Text style={styles.wrongNumberLink}>Change it</Text>
          </Pressable>
        </View>
      </View>
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
  maskedPhoneContainer: {
    marginBottom: 32,
  },
  maskedPhonePrefix: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  maskedPhone: {
    fontFamily: fontFamily.inter.medium,
    fontSize: 15,
    color: colors.primary,
  },
  otpContainer: {
    marginBottom: 24,
  },
  countdownSection: {
    alignItems: 'flex-start',
    marginBottom: 16,
    height: 24, // Fixed height to prevent jump when swapping
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  timeText: {
    fontFamily: fontFamily.inter.bold,
    fontSize: 16,
    color: colors.primary,
  },
  resendContainer: {
    justifyContent: 'center',
  },
  resendText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  wrongNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrongNumberPrefix: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  wrongNumberLink: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 13,
    color: colors.primary,
  },
  errorText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 13,
    color: colors.textDanger,
    marginBottom: 16,
  }
});
