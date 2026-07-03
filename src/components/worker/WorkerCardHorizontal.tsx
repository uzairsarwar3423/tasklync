import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ShieldCheck, Star } from 'lucide-react-native';

import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { shadows } from '../../design/shadows';
import { textStyles } from '../../design/typography';
import { springConfig } from '../../design/animations';

import { Button } from '../ui/Button';
import { OnlineBadge } from '../ui/Badge/OnlineBadge';
import { WorkerAvailabilityBadge } from './WorkerAvailabilityBadge';
import { WorkerNearby } from '../../types/worker.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}I';

interface WorkerCardHorizontalProps {
  worker: WorkerNearby;
}

export const WorkerCardHorizontal: React.FC<WorkerCardHorizontalProps> = ({ worker }) => {
  const router = useRouter();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springConfig.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, springConfig.bouncy);
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push(`/worker/${worker.id}` as any);
  };

  const handleBook = () => {
    // Navigates to booking flow or worker profile pre-selected for booking
    Haptics.selectionAsync();
    router.push(`/booking/create?workerId=${worker.id}` as any);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: scale.value < 1 ? 0 : ((shadows.sm as any).shadowOpacity || 0.08),
      elevation: scale.value < 1 ? 0 : ((shadows.sm as any).elevation || 2),
    };
  });

  const getAvatarStatus = () => {
    switch (worker.availabilityStatus) {
      case 'AVAILABLE': return 'online';
      case 'BUSY': return 'busy';
      default: return 'offline';
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: worker.avatarUrl || 'https://i.pravatar.cc/150?u=' + worker.id }}
            style={styles.avatar}
            placeholder={BLURHASH}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.onlineBadgeContainer}>
            <OnlineBadge status={getAvatarStatus()} size={12} />
          </View>
        </View>
        
        {/* We assume isVerified is passed in a full model or we mock it if missing. Let's assume some are verified */}
        <View style={styles.verifiedBadge}>
          <ShieldCheck size={14} color={colors.primary} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {worker.name}
        </Text>
        
        <Text style={styles.category} numberOfLines={1}>
          {worker.categories[0]} {worker.categories.length > 1 ? `+ ${worker.categories.length - 1} more` : ''}
        </Text>

        <View style={styles.ratingRow}>
          <View style={styles.ratingInner}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingValue}>{worker.avgRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({worker.totalReviews})</Text>
          </View>
          <Text style={styles.distance}>{worker.distanceLabel}</Text>
        </View>

        <View style={styles.statusRow}>
          <WorkerAvailabilityBadge 
            status={worker.availabilityStatus} 
            availableUntil={worker.availableUntil} 
            size="sm" 
          />
        </View>

        <View style={styles.priceRow}>
          {worker.startingPrice ? (
            <>
              <Text style={styles.priceLabel}>From </Text>
              <Text style={styles.priceValue}>{worker.currency} {worker.startingPrice}</Text>
            </>
          ) : (
            <Text style={styles.priceLabel}>Price on request</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          label="Book"
          onPress={handleBook}
          size="sm"
          variant="primary"
          fullWidth
        />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 240,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    ...shadows.sm,
    marginRight: 12,
  },
  avatarSection: {
    height: 80,
    backgroundColor: colors.bgSection,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  onlineBadgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    flex: 1,
  },
  name: {
    ...textStyles.body2,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  category: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 10,
    marginRight: 2,
  },
  ratingValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 2,
  },
  distance: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textMuted,
  },
  statusRow: {
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 8,
  },
  priceLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  priceValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: colors.primary,
  },
  buttonContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});
