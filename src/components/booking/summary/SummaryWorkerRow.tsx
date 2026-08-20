import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { UserCheck, Star, User } from 'lucide-react-native';
import { SummarySectionCard } from './SummarySectionCard';
import { WorkerInfo } from '../../../store/cart.store';
import { colors, palette, fontFamily } from '../../../design';

export interface SummaryWorkerRowProps {
  worker: WorkerInfo | null;
}

export const SummaryWorkerRow: React.FC<SummaryWorkerRowProps> = ({ worker }) => {
  const workerName = worker?.name || 'Assigned Professional';
  const avatarUrl = worker?.avatarUrl;
  const rating = worker?.avgRating;
  const category = worker?.category || 'Service Professional';

  return (
    <SummarySectionCard
      icon={<UserCheck size={16} color={colors.primaryDark} strokeWidth={2.2} />}
      title="Service Professional"
    >
      <View style={styles.contentRow}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={22} color={palette.gray500} />
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{workerName}</Text>
          <Text style={styles.categoryText}>{category}</Text>

          {typeof rating === 'number' && rating > 0 && (
            <View style={styles.ratingRow}>
              <Star size={12} color={palette.warning} fill={palette.warning} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              <Text style={styles.ratingLabel}>Verified Provider</Text>
            </View>
          )}
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
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.gray100,
    borderWidth: 1,
    borderColor: palette.gray200,
    alignItems: 'center',
    justifyContent: 'center',
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
