import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { WorkerNearby } from '../../types/worker.types';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { springConfig } from '../../design/animations';
import { shadows } from '../../design/shadows';
import { radius } from '../../design/radius';
import { OnlineBadge } from '../ui/Badge/OnlineBadge';
import { WorkerAvailabilityBadge } from './WorkerAvailabilityBadge';
import { Chip } from '../ui/Chip';

interface WorkerSearchCardProps {
  worker: WorkerNearby;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const WorkerSearchCard: React.FC<WorkerSearchCardProps> = ({ worker }) => {
  const router = useRouter();
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.05); // Initial sm shadow

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springConfig.stiff);
    shadowOpacity.value = withSpring(0, springConfig.stiff);

    // Prefetch profile
    // queryClient.prefetchQuery({ queryKey: ['worker', worker.id], ... })
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, springConfig.default);
    shadowOpacity.value = withSpring(0.05, springConfig.default);
  };

  const handlePress = () => {
    // Navigate to worker profile
    router.push(`/worker/${worker.id}` as any);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.leftColumn}>
        <Image
          source={{ uri: worker.avatarUrl || 'https://via.placeholder.com/52' }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.onlineBadgeContainer}>
          <OnlineBadge status={worker.availabilityStatus === 'AVAILABLE' ? 'online' : 'offline'} />
        </View>
      </View>

      <View style={styles.centerColumn}>
        <Text style={styles.name} numberOfLines={1}>
          {worker.name}
        </Text>

        <View style={styles.chipsRow}>
          {worker.categories?.slice(0, 3).map((skill: string, idx) => (
            <Chip
              key={idx}
              label={skill}
              variant="tag"
              size="xs"
              style={styles.chipStyle}
            />
          ))}
        </View>

        <View style={styles.ratingRow}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.ratingText}>{worker.avgRating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.reviewsText}> ({worker.totalReviews || 0})</Text>
          <Text style={styles.separator}> · </Text>
          <Text style={styles.distanceText}>{(worker.distanceMeters / 1000).toFixed(1) || 0} km</Text>
        </View>
      </View>

      <View style={styles.rightColumn}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceUnit}>Starts at </Text>
          <Text style={styles.priceAmount}>{worker.currency || 'Rs'} {worker.startingPrice || 500}</Text>
        </View>
        <WorkerAvailabilityBadge status={worker.availabilityStatus || 'AVAILABLE'} size="sm" />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 10,
    ...shadows.sm,
  },
  leftColumn: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineBadgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  centerColumn: {
    flex: 1,
    marginLeft: 12,
    gap: 3,
  },
  name: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chipStyle: {
    // specific margins if needed, gap handles it usually
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  starIcon: {
    fontSize: 14,
    color: '#F59E0B', // Gold
    marginRight: 4,
  },
  ratingText: {
    fontFamily: typography.fontFamily.inter.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reviewsText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  separator: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  distanceText: {
    fontFamily: typography.fontFamily.inter.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    paddingTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontFamily: typography.fontFamily.inter.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  priceUnit: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 2,
  },
});
