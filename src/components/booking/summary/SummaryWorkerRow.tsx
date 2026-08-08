import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { UserCheck, Star } from 'lucide-react-native';
import { SummarySectionCard } from './SummarySectionCard';
import { WorkerInfo } from '../../../store/cart.store';
import { colors, palette, fontFamily } from '../../../design';

export interface SummaryWorkerRowProps {
  worker: WorkerInfo | null;
}

export const SummaryWorkerRow: React.FC<SummaryWorkerRowProps> = ({ worker }) => {
  const workerName = worker?.name || 'Selected Professional Provider';
  const avatarUrl = worker?.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150';
  const rating = worker?.avgRating || 4.9;
  const category = worker?.category || 'Professional Service';

  return (
    <SummarySectionCard
      icon={<UserCheck size={16} color={colors.primaryDark} strokeWidth={2.2} />}
      title="Service Professional"
    >
      <View style={styles.contentRow}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{workerName}</Text>
          <Text style={styles.categoryText}>{category}</Text>

          <View style={styles.ratingRow}>
            <Star size={12} color={palette.warning} fill={palette.warning} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>Verified Provider</Text>
          </View>
        </View>
      </View>
    </SummarySectionCard>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.gray200,
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  categoryText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontFamily: fontFamily.inter.bold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  ratingLabel: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 11,
    color: colors.primaryDark,
    marginLeft: 4,
  },
});
