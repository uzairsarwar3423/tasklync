import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Calendar } from 'lucide-react-native';

import { useRouter } from 'expo-router';

export function EmptyBookingsActive() {
  const router = useRouter();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.iconContainer}>
        <Calendar size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.title}>No active bookings</Text>
      <Text style={styles.description}>You don't have any upcoming or ongoing services right now.</Text>
      
      <Pressable style={styles.button} onPress={() => router.push('/(tabs)' as any)}>
        <Text style={styles.buttonText}>Browse Services</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 64,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: '#374151',
  },
});
