import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ShieldCheck } from 'lucide-react-native';
import { formatDistanceToNow, format, parseISO, differenceInDays } from 'date-fns';
import { colors } from '../../design/colors';
import { fontFamily as fonts } from '../../design/typography';

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
      const days = differenceInDays(new Date(), parsedDate);
      if (days < 30) {
        return formatDistanceToNow(parsedDate, { addSuffix: true });
      }
      return format(parsedDate, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Left Avatar */}
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[
            styles.avatar,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.fallbackAvatar,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        >
          <Text style={[styles.fallbackText, { fontSize: avatarSize * 0.4 }]}>
            {getInitials(reviewerName)}
          </Text>
        </View>
      )}

      {/* Center Details */}
      <View style={styles.centerCol}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.nameText, { fontSize: nameSize }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {reviewerName}
          </Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={12} color={colors.primaryDark} strokeWidth={2.5} />
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
    backgroundColor: colors.bgSection,
  },
  fallbackAvatar: {
    backgroundColor: colors.bgSection,
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
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  nameText: {
    fontFamily: fonts.jakarta.semiBold,
    color: colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSuccess,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  verifiedText: {
    fontFamily: fonts.jakarta.medium,
    fontSize: 10,
    color: colors.primaryDark,
  },
  dateText: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 8,
  },
});
