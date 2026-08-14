import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageTimestampProps {
  label: string;
}

export const MessageTimestamp = React.memo(function MessageTimestamp({
  label,
}: MessageTimestampProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  pill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  text: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.2,
  },
});
