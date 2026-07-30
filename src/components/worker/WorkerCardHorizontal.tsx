import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ShieldCheck, Star } from 'lucide-react-native';

import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { shadows } from '../../design/shadows';
import { textStyles } from '../../design/typography';

import { OnlineBadge } from '../ui/Badge/OnlineBadge';
import { WorkerNearby } from '../../types/worker.types';

const BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}I';

interface WorkerCardHorizontalProps {
  worker: WorkerNearby;
}

export const WorkerCardHorizontal: React.FC<WorkerCardHorizontalProps> = ({ worker }) => {
  const router = useRouter();

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push(`/worker/${worker.id}` as any);
  };

  const getAvatarStatus = () => {
    switch (worker.availabilityStatus) {
      case 'AVAILABLE': return 'online';
      case 'BUSY': return 'busy';
      default: return 'offline';
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
    >
      <View style={styles.avatarSection}>
        <Image
          source={{ uri: worker.avatarUrl || 'https://i.pravatar.cc/150?u=' + worker.id }}
          style={styles.avatar}
          placeholder={BLURHASH}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.onlineBadgeContainer}>
          <OnlineBadge status={getAvatarStatus()} size={14} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {worker.name}
          </Text>
          <ShieldCheck size={14} color={colors.primary} style={{ marginLeft: 4 }} />
        </View>
        
        <Text style={styles.category} numberOfLines={1}>
          {worker.categories[0]}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Star size={12} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.statText}>{worker.avgRating.toFixed(1)}</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.distanceText}>{worker.distanceLabel}</Text>
        </View>

        <View style={styles.priceRow}>
          {worker.startingPrice ? (
            <Text style={styles.priceValue}>{worker.currency} {worker.startingPrice}<Text style={styles.priceSuffix}>/hr</Text></Text>
          ) : (
            <Text style={styles.priceValue}>Custom</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 156,
    height: 216,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    ...shadows.sm,
    marginRight: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  pressed: {
    opacity: 0.8,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 12,
    marginTop: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  onlineBadgeContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: colors.bgCard,
    borderRadius: 10,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  category: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSection,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  dot: {
    color: colors.textMuted,
    marginHorizontal: 6,
    fontSize: 10,
  },
  distanceText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: colors.primary,
  },
  priceSuffix: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: colors.textMuted,
  },
});
