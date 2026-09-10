import React, { useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { WorkerCardHorizontal } from '../worker/WorkerCardHorizontal';
import { SkeletonWorkerCardHorizontal } from '../ui/Skeleton/SkeletonWorkerCardHorizontal';
import { EmptyState } from '../feedback/EmptyState';
import { useNearbyWorkers } from '../../hooks/useNearbyWorkers';
import { WorkerNearby } from '../../types/worker.types';
import { colors } from '../../design/colors';

const CARD_GAP = 14;

// High-fidelity fallback workers for seedless / local development environments
const FALLBACK_NEARBY_WORKERS: WorkerNearby[] = [
  {
    id: 'w1',
    name: 'Ahmed Khan',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    avgRating: 4.9,
    totalReviews: 124,
    currency: 'PKR',
    distanceMeters: 1200,
    distanceLabel: '1.2 km away',
    categories: ['Electrician', 'AC Repair'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '18:00',
    isOnJob: false,
    responseTimeMins: 5,
    startingPrice: 400,
  },
  {
    id: 'w2',
    name: 'Sarah Ali',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    avgRating: 4.8,
    totalReviews: 89,
    currency: 'PKR',
    distanceMeters: 2300,
    distanceLabel: '2.3 km away',
    categories: ['Plumbing Specialist', 'Deep Cleaning'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '19:00',
    isOnJob: false,
    responseTimeMins: 12,
    startingPrice: 1200,
  },
  {
    id: 'w3',
    name: 'Bilal Malik',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    avgRating: 4.9,
    totalReviews: 205,
    currency: 'PKR',
    distanceMeters: 3100,
    distanceLabel: '3.1 km away',
    categories: ['HVAC & Cooling', 'Electrician'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '19:00',
    isOnJob: false,
    responseTimeMins: 8,
    startingPrice: 800,
  },
  {
    id: 'w4',
    name: 'Zainab Bibi',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    avgRating: 4.7,
    totalReviews: 54,
    currency: 'PKR',
    distanceMeters: 800,
    distanceLabel: '800 m away',
    categories: ['House Cleaning', 'Sanitization'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '20:00',
    isOnJob: false,
    responseTimeMins: 2,
    startingPrice: 600,
  },
  {
    id: 'w5',
    name: 'Tariq Mahmood',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    avgRating: 4.6,
    totalReviews: 78,
    currency: 'PKR',
    distanceMeters: 1700,
    distanceLabel: '1.7 km away',
    categories: ['Master Painter', 'Waterproofing'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '17:00',
    isOnJob: false,
    responseTimeMins: 15,
    startingPrice: 700,
  },
];

export const NearbyWorkersList = () => {
  const router = useRouter();
  const { workers, isLoading, error, refetch } = useNearbyWorkers();
  const { width: windowWidth } = useWindowDimensions();

  // Reduced card width (~72% of screen width) for a sleek, compact card profile
  const cardWidth = useMemo(() => {
    return windowWidth
      ? Math.min(Math.round(windowWidth * 0.72), 300)
      : 280;
  }, [windowWidth]);

  const snapInterval = useMemo(() => cardWidth + CARD_GAP, [cardWidth]);

  // Determine list items: use backend workers if returned; fallback to demo workers
  const displayWorkers = useMemo(() => {
    if (workers && workers.length > 0) {
      return workers.slice(0, 10);
    }
    return FALLBACK_NEARBY_WORKERS;
  }, [workers]);

  const opacityList = useSharedValue(0);
  const opacitySkeleton = useSharedValue(1);

  useEffect(() => {
    if (!isLoading) {
      opacitySkeleton.value = withTiming(0, { duration: 180 });
      opacityList.value = withDelay(80, withTiming(1, { duration: 220 }));
    } else {
      opacitySkeleton.value = withTiming(1, { duration: 150 });
      opacityList.value = withTiming(0, { duration: 150 });
    }
  }, [isLoading]);

  const animatedListStyle = useAnimatedStyle(() => ({
    opacity: opacityList.value,
  }));

  const animatedSkeletonStyle = useAnimatedStyle(() => ({
    opacity: opacitySkeleton.value,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: isLoading ? 1 : -1,
  }));

  const handleBookNow = useCallback((worker: WorkerNearby) => {
    router.push(`/worker/${worker.id}` as any);
  }, [router]);

  const handleSeeAll = useCallback(() => {
    router.push('/(tabs)/explore' as any);
  }, [router]);

  const renderWorker = useCallback(
    ({ item }: { item: WorkerNearby }) => (
      <WorkerCardHorizontal
        worker={item}
        cardWidth={cardWidth}
        onBookNow={handleBookNow}
      />
    ),
    [cardWidth, handleBookNow]
  );

  const renderItemSeparator = useCallback(() => (
    <View style={{ width: CARD_GAP }} />
  ), []);

  const renderSkeleton = () => (
    <Animated.View style={[styles.skeletonContainer, animatedSkeletonStyle]}>
      <View style={{ marginRight: CARD_GAP }}><SkeletonWorkerCardHorizontal /></View>
      <View><SkeletonWorkerCardHorizontal /></View>
    </Animated.View>
  );

  const hasEmptyState = !isLoading && (!workers || workers.length === 0) && displayWorkers.length === 0;

  return (
    <View style={styles.sectionContainer}>
      {/* ── Section Header ── */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Nearby Workers</Text>
        <Pressable
          onPress={handleSeeAll}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="See all nearby workers"
        >
          <Text style={styles.actionLabel}>See all →</Text>
        </Pressable>
      </View>

      {/* ── Content Area ── */}
      <View style={styles.contentContainer}>
        {error && displayWorkers.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Couldn't load nearby workers.</Text>
            <Pressable onPress={() => refetch()} hitSlop={10}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : hasEmptyState ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="No workers nearby"
              subtitle="Try expanding your search radius or check back later"
              actionLabel="Search all workers"
              onAction={() => router.push('/search' as any)}
            />
          </View>
        ) : (
          <>
            {renderSkeleton()}

            <Animated.View style={[styles.listWrapper, animatedListStyle]}>
              <FlatList
                data={displayWorkers}
                renderItem={renderWorker}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                directionalLockEnabled={true}
                alwaysBounceVertical={false}
                snapToInterval={snapInterval}
                snapToAlignment="start"
                decelerationRate="fast"
                bounces={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={renderItemSeparator}
                initialNumToRender={2}
                maxToRenderPerBatch={3}
                windowSize={5}
                removeClippedSubviews={false}
              />
            </Animated.View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    width: '100%',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16, // Generous vertical spacing between header and worker cards
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13.5,
    color: colors.primary, // Brand green accent color
  },
  contentContainer: {
    height: 244,
    position: 'relative',
    overflow: 'visible',
    zIndex: 10,
  },
  listWrapper: {
    height: 244,
    overflow: 'visible',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10, // Full headroom for soft card drop shadows and rounded corners
  },
  skeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  emptyContainer: {
    minHeight: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: colors.textMuted,
  },
  retryText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: colors.primary,
    marginLeft: 6,
  },
});
