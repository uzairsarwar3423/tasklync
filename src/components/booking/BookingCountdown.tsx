import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { useBookingCountdown } from '../../hooks/useBookingCountdown';
import { Clock } from 'lucide-react-native';

interface BookingCountdownProps {
  expiresAt?: string | undefined;
  status: string;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export function BookingCountdown({ expiresAt, status }: BookingCountdownProps) {
  if (status !== 'PENDING' || !expiresAt) return null;

  const { minutes, seconds, isExpired } = useBookingCountdown(expiresAt);

  const animatedProps = useAnimatedProps(() => {
    if (isExpired.value) {
      return { text: 'Expired' } as any;
    }
    return { text: `Expires in ${minutes.value}:${seconds.value}` } as any;
  });

  return (
    <View style={styles.container}>
      <Clock size={14} color="#F59E0B" style={styles.icon} />
      <AnimatedTextInput
        underlineColorAndroid="transparent"
        editable={false}
        animatedProps={animatedProps}
        style={styles.countdownText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  icon: {
    marginRight: 6,
  },
  countdownText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#D97706',
    padding: 0,
    margin: 0,
  },
});
