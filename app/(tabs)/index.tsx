import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { HomeHeader } from '../../src/components/home/HomeHeader';
import { SearchPromptBar } from '../../src/components/home/SearchPromptBar';
import { CategoryGrid } from '../../src/components/home/CategoryGrid';
import { NearbyWorkersList } from '../../src/components/home/NearbyWorkersList';
import { BannerCarousel } from '../../src/components/home/BannerCarousel';
import { PopularServicesSection } from '../../src/components/home/PopularServicesSection';
import { RecentBookingBanner } from '../../src/components/home/RecentBookingBanner';
import { CustomRefreshControl } from '../../src/components/feedback/CustomRefreshControl';

import { useCategories } from '../../src/hooks/useCategories';
import { useNearbyWorkers } from '../../src/hooks/useNearbyWorkers';
import { usePopularServices } from '../../src/hooks/usePopularServices';
import { useActiveBooking } from '../../src/hooks/useActiveBooking';

import { colors } from '../../src/design/colors';

export default function HomeScreen() {
  const { refetch: refetchCategories } = useCategories();
  const { refetch: refetchWorkers } = useNearbyWorkers();
  const { refetch: refetchPopular } = usePopularServices();
  const { refetch: refetchBooking } = useActiveBooking();

  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchCategories(),
      refetchWorkers(),
      refetchPopular(),
      refetchBooking(),
    ]);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 44 }]}
        refreshControl={
          <CustomRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <HomeHeader />
        
        <RecentBookingBanner />
        
        <View style={styles.searchWrapper}>
          <SearchPromptBar />
        </View>
        
        <View style={styles.sectionSpacer}>
          <BannerCarousel />
        </View>
        
        <View style={styles.sectionSpacer}>
          <CategoryGrid />
        </View>
        
        <View style={styles.sectionSpacer}>
          <NearbyWorkersList />
        </View>
        
        <View style={styles.sectionSpacer}>
          <PopularServicesSection />
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  scrollContent: {
    paddingBottom: 120, // Space for tab bar + safe area padding
  },
  searchWrapper: {
    marginTop: 12,
    paddingHorizontal: 16,
    marginBottom: 24, // Spacing to next section
  },
  sectionSpacer: {
    marginBottom: 24,
  }
});
