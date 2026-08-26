import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2, User } from 'lucide-react-native';
import { colors, palette, fontFamily, fontSize, radius, shadows, spacing } from '../../design';

export interface ReviewWorkerContextProps {
  workerName: string;
  workerAvatar?: string | null | undefined;
  serviceName?: string | undefined;
  completedDate?: string | undefined;
}

/**
 * ReviewWorkerContext Component
 *
 * Re-anchors context at the top of the review screen:
 * - Shows worker avatar with fallback placeholder (using high-performance expo-image)
 * - Verified pro badge and typography hierarchy
 * - Job title and completed date
 * - Fixed height to avoid pushing rating section offscreen on small devices
 */
export const ReviewWorkerContext: React.FC<ReviewWorkerContextProps> = ({
  workerName,
  workerAvatar,
  serviceName,
  completedDate,
}) => {
  const formattedDate = useMemo(() => {
    if (!completedDate) return 'Completed recently';
    try {
      const d = new Date(completedDate);
      if (isNaN(d.getTime())) return completedDate;
      return `Completed on ${d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    } catch {
      return completedDate;
    }
  }, [completedDate]);

  return (
    <View style={styles.card} accessibilityRole="summary">
      {/* Avatar Slot */}
      <View style={styles.avatarContainer}>
        {workerAvatar ? (
          <Image
            source={{ uri: workerAvatar }}
            style={styles.avatarImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <User size={24} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Worker & Service Metadata */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text style={styles.workerName} numberOfLines={1}>
            {workerName || 'Service Professional'}
          </Text>
          <CheckCircle2 size={16} color={colors.primary} style={styles.verifiedIcon} />
        </View>

        {serviceName ? (
          <Text style={styles.serviceName} numberOfLines={1}>
            {serviceName}
          </Text>
        ) : null}

        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: palette.gray100,
    marginRight: spacing.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray100,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  workerName: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.body1 - 1,
    color: colors.textPrimary,
    flexShrink: 1,
    marginRight: spacing.xs,
  },
  verifiedIcon: {
    flexShrink: 0,
  },
  serviceName: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: fontSize.body2 - 1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dateText: {
    fontFamily: fontFamily.inter.regular,
    fontSize: fontSize.dataXS + 0.5,
    color: colors.textMuted,
  },
});
