import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { BookingsHeader } from '../../src/components/booking/BookingsHeader';
import { BookingsTabBar } from '../../src/components/booking/BookingsTabBar';
import { BookingList } from '../../src/components/booking/BookingList';
import { useBookingsList, TabType } from '../../src/hooks/useBookingsList';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('ACTIVE');
  const { bookings, isLoading, refetch } = useBookingsList(activeTab);

  // Automatically refresh bookings whenever user navigates to Bookings tab
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <View style={styles.container}>
      <BookingsHeader />
      <BookingsTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Animated.View 
        key={activeTab} // Forces unmount/remount on tab change for cross-fade
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        style={styles.listContainer}
      >
        <BookingList 
          bookings={bookings} 
          isLoading={isLoading} 
          activeTab={activeTab}
          onRefresh={refetch}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
});
