import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

import { Section } from '../layout/Section';
import { WorkerCardHorizontal } from '../worker/WorkerCardHorizontal';
import { SkeletonWorkerCardHorizontal } from '../ui/Skeleton';
import { EmptyState } from '../feedback/EmptyState';
import { useNearbyWorkers } from '../../hooks/useNearbyWorkers';
import { WorkerNearby } from '../../types/worker.types';
import { colors } from '../../design/colors';

const { width: screenWidth } = Dimensions.get('window');

const AnyFlashList = FlashList as any;

export const NearbyWorkersList = () => {
  const router = useRouter();
  const { workers, isLoading, error, refetch } = useNearbyWorkers();
  
  const opacityList = useSharedValue(0);
  const opacitySkeleton = useSharedValue(1);

  useEffect(() => {
    if (!isLoading && workers) {
      opacitySkeleton.value = withTiming(0, { duration: 200 });
      opacityList.value = withDelay(100, withTiming(1, { duration: 200 }));
    }
  }, [isLoading, workers]);

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

  const renderWorker = ({ item }: { item: WorkerNearby }) => (
    <WorkerCardHorizontal worker={item} />
  );

  const renderSkeleton = () => (
    <Animated.View style={[styles.skeletonContainer, animatedSkeletonStyle]}>
      <View style={styles.skeletonWrapper}><SkeletonWorkerCardHorizontal /></View>
      <View style={styles.skeletonWrapper}><SkeletonWorkerCardHorizontal /></View>
      <View style={styles.skeletonWrapper}><SkeletonWorkerCardHorizontal /></View>
      <View style={styles.skeletonWrapper}><SkeletonWorkerCardHorizontal /></View>
    </Animated.View>
  );

  return (
    <Section
      title="Near You"
      actionLabel="See on map →"
      onAction={() => router.push('/(map)/live-map' as any)}
    >
      <View style={styles.container}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Couldn't load nearby workers.</Text>
            <Pressable onPress={() => refetch()} hitSlop={10}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : !isLoading && workers?.length === 0 ? (
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
              <AnyFlashList
                data={workers?.slice(0, 8) || []}
                renderItem={renderWorker}
                keyExtractor={(item: WorkerNearby) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={160}
                contentContainerStyle={styles.listContent}
                bounces={true}
                decelerationRate="fast"
              />
            </Animated.View>
          </>
        )}
      </View>
    </Section>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 236,
  },
  listWrapper: {
    height: 236, // 216 (card) + 20 (padding)
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 4, // Peek effect (12px visible of next card)
  },
  skeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  skeletonWrapper: {
    marginRight: 16,
  },
  emptyContainer: {
    height: 236,
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
