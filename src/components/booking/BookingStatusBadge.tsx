import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookingStatus } from '../../types/booking.types';
import { bookingStatusMap } from '../../utils/bookingStatusMap';
import { BookingStatusDot } from './BookingStatusDot';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = bookingStatusMap[status];
  if (!config) return null;

  return (
    <View style={[styles.badge, { backgroundColor: config.color }]}>
      {status === 'IN_PROGRESS' && <BookingStatusDot status={status} />}
      {!['IN_PROGRESS'].includes(status) && (
        <config.icon size={12} color="#FFFFFF" style={styles.icon} />
      )}
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
});
