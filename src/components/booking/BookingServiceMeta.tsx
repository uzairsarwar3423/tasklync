import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatPKTDateTime } from '../../utils/timezone';

interface BookingServiceMetaProps {
  scheduledAt: string;
}

export function BookingServiceMeta({ scheduledAt }: BookingServiceMetaProps) {
  const formattedDateTime = formatPKTDateTime(scheduledAt);

  return (
    <View style={styles.container}>
      <Text style={styles.dateTime}>
        {formattedDateTime}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  dateTime: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#374151',
  },
});
