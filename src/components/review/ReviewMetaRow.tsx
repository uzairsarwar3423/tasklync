import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ShieldCheck } from 'lucide-react-native';
import { formatDistanceToNow, format, parseISO, differenceInDays } from 'date-fns';
import { colors } from '@design/colors';
import { fontFamily as fonts } from '@design/typography';
import { radius } from '@design/radius';

interface ReviewMetaRowProps {
  avatarUrl: string | null;
  reviewerName: string;
  date: string;
  isVerified?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const ReviewMetaRow = ({
  avatarUrl,
  reviewerName,
  date,
  isVerified = false,
  size = 'md',
  style,
}: ReviewMetaRowProps) => {
  const avatarSize = size === 'md' ? 40 : 32;
  const nameSize = size === 'md' ? 14 : 13;

  const formatDate = (dateString: string) => {
    try {
      const parsedDate = parseISO(dateString);
      const daysDiff = differenceInDays(new Date(), parsedDate);
      
      if (daysDiff < 30) {
        return formatDistanceToNow(parsedDate, { addSuffix: true });
      }
      return format(parsedDate, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Avatar */}
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.fallbackAvatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
          <Text style={[styles.fallbackText, { fontSize: avatarSize * 0.4 }]}>
            {getInitials(reviewerName)}
          </Text>
        </View>
      )}

      {/* Center Details */}
      <View style={styles.centerCol}>
        <View style={styles.nameRow}>
          <Text style={[styles.nameText, { fontSize: nameSize }]} numberOfLines={1}>
            {reviewerName}
          </Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={10} color={colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
      </View>

      {/* Right Date */}
      <Text style={styles.dateText}>{formatDate(date)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.bgSecondary,
  },
  fallbackAvatar: {
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontFamily: fonts.poppins.semiBold,
    color: colors.textSecondary,
  },
  centerCol: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  nameText: {
    fontFamily: fonts.poppins.semiBold,
    color: colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    gap: 2,
  },
  verifiedText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 10,
    color: colors.primary,
  },
  dateText: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 8,
  },
});
