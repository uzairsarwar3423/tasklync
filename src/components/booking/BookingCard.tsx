import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BookingDetails } from '../../types/booking.types';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingWorkerRow } from './BookingWorkerRow';
import { BookingServiceMeta } from './BookingServiceMeta';
import { BookingPriceTag } from './BookingPriceTag';
import { BookingCountdown } from './BookingCountdown';
import { BookingActions } from './BookingActions';
import { useRouter } from 'expo-router';

interface BookingCardProps {
  booking: BookingDetails;
}

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/booking/${booking.id}` as any);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'track':
        router.push(`/booking/${booking.id}/track` as any);
        break;
      case 'message':
        router.push(`/booking/${booking.id}/chat` as any);
        break;
      case 'book_again':
        router.push('/(tabs)' as any);
        break;
      default:
        router.push(`/booking/${booking.id}` as any);
        break;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <BookingStatusBadge status={booking.status} />
        <BookingPriceTag amount={booking.estimated_total} currency={booking.currency} />
      </View>

      <BookingWorkerRow
        workerName={booking.worker_name}
        categoryName={booking.category_name}
        workerAvatarUrl={booking.worker_avatar_url}
      />

      <BookingServiceMeta scheduledAt={booking.scheduled_at} />
      
      {booking.status === 'PENDING' && (
        <BookingCountdown expiresAt={booking.expires_at} status={booking.status} />
      )}

      <BookingActions status={booking.status} onAction={handleAction} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
