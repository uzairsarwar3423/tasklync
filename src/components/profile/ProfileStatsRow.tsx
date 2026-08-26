import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Star } from 'lucide-react-native';
import { UserProfileStats } from '../../types/user.types';
import { colors, palette, fontFamily, fontSize, radius, spacing, shadows } from '../../design';

export interface ProfileStatsRowProps {
  stats?: UserProfileStats | undefined;
}

/**
 * ProfileStatsRow Component (Day 35)
 *
 * Implements Aesthetic-Usability Effect:
 * - 2 truthful stat cards (Bookings completed & Customer rating)
 * - Inter Bold for numbers (standardizing data typography)
 * - Jakarta Sans for labels
 */
export const ProfileStatsRow: React.FC<ProfileStatsRowProps> = ({ stats }) => {
  const bookingsCount = stats?.bookings_count ?? stats?.completed_jobs ?? 0;
  const rating = stats?.rating ? stats.rating.toFixed(1) : '5.0';

  return (
    <View style={styles.container}>
      {/* Stat 1: Completed Bookings */}
      <View style={styles.statCard}>
        <View style={styles.iconCircle}>
          <CheckCircle2 size={18} color={colors.primaryDark} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.statValue}>{bookingsCount}</Text>
          <Text style={styles.statLabel}>Jobs Completed</Text>
        </View>
      </View>

      {/* Stat 2: Customer Rating */}
      <View style={styles.statCard}>
        <View style={[styles.iconCircle, styles.iconCircleRating]}>
          <Star size={18} color="#D97706" fill="#F59E0B" />
        </View>
        <View style={styles.textCol}>
          <View style={styles.ratingRow}>
            <Text style={styles.statValue}>{rating}</Text>
            <Text style={styles.ratingMax}>/5.0</Text>
          </View>
          <Text style={styles.statLabel}>User Rating</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md - 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
    borderWidth: 1,
    borderColor: palette.green200,
  },
  iconCircleRating: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  textCol: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statValue: {
    fontFamily: fontFamily.inter.bold,
    fontSize: fontSize.h4,
    color: colors.textPrimary,
  },
  ratingMax: {
    fontFamily: fontFamily.inter.regular,
    fontSize: fontSize.dataXS,
    color: colors.textMuted,
  },
  statLabel: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.caption - 1,
    color: colors.textMuted,
    marginTop: -1,
  },
});
