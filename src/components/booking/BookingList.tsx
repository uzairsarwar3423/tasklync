import React, { useCallback, useRef } from 'react';
import { StyleSheet, View, RefreshControl } from 'react-native';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BookingDetails } from '../../types/booking.types';
import { BookingCard } from './BookingCard';
import { BookingCardSkeleton } from './BookingCardSkeleton';
import { EmptyBookingsActive } from '../feedback/EmptyState/EmptyBookingsActive';
import { EmptyBookingsPast } from '../feedback/EmptyState/EmptyBookingsPast';
import { EmptyBookingsCancelled } from '../feedback/EmptyState/EmptyBookingsCancelled';
import { TabType } from '../../hooks/useBookingsList';

interface BookingListProps {
  bookings: BookingDetails[];
  isLoading: boolean;
  activeTab: TabType;
  onRefresh: () => void;
}

export function BookingList({ bookings, isLoading, activeTab, onRefresh }: BookingListProps) {
  const isFirstMount = useRef(true);

  // After first render of items, it's no longer first mount for stagger
  if (!isLoading && bookings.length > 0 && isFirstMount.current) {
    setTimeout(() => {
      isFirstMount.current = false;
    }, 500);
  }

  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<BookingDetails>) => {
    // Entrance stagger applied once, opacity fade only, 30ms apart, capped at 6
    const delay = isFirstMount.current && index < 6 ? index * 30 : 0;
    
    return (
      <Animated.View 
        entering={FadeIn.delay(delay).duration(200)} 
        exiting={FadeOut.duration(150)}
      >
        <BookingCard booking={item} />
      </Animated.View>
    );
  }, []);

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          <BookingCardSkeleton />
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </View>
      );
    }

    if (activeTab === 'ACTIVE') return <EmptyBookingsActive />;
    if (activeTab === 'PAST') return <EmptyBookingsPast />;
    return <EmptyBookingsCancelled />;
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={isLoading ? [] : bookings}
        renderItem={renderItem}
        keyExtractor={(item: BookingDetails) => item.id}
        estimatedItemSize={210}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading && !isFirstMount.current} 
            onRefresh={onRefresh}
            tintColor="#16A34A"
            colors={['#16A34A']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  skeletonContainer: {
    paddingTop: 8,
  },
});
