import React from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { typography } from '../../design/typography';

interface WorkerStatsProps {
  rating: number;
  totalReviews: number;
  totalJobs: number;
  avgResponseMins: number;
  onRatingPress?: () => void;
  style?: ViewStyle;
}

export const WorkerStats: React.FC<WorkerStatsProps> = ({
  rating,
  totalReviews,
  totalJobs,
  avgResponseMins,
  onRatingPress,
  style,
}) => {
  const handleRatingPress = () => {
    Haptics.selectionAsync();
    if (onRatingPress) {
      onRatingPress();
    }
  };

  // Render yellow stars dynamically
  const renderStars = () => {
    return (
      <View style={styles.starRow}>
        <Star size={10} color="#EAB308" fill="#EAB308" />
        <Star size={10} color="#EAB308" fill="#EAB308" style={styles.starSpacing} />
        <Star size={10} color="#EAB308" fill="#EAB308" style={styles.starSpacing} />
      </View>
    );
  };

  const formattedRating = typeof rating === 'number' ? rating.toFixed(1) : '5.0';

  return (
    <View style={[styles.container, style]}>
      {/* Cell 1: Rating */}
      <Pressable onPress={handleRatingPress} style={styles.cell}>
        <Text style={styles.valueText}>{formattedRating}</Text>
        {renderStars()}
        <Text style={styles.labelText}>Rating ({totalReviews || 0})</Text>
      </Pressable>

      {/* Cell 2: Completed Jobs */}
      <View style={[styles.cell, styles.middleBorder]}>
        <View style={styles.valueWithUnit}>
          <Text style={styles.valueText}>{totalJobs || 0}</Text>
          <Text style={styles.unitText}>jobs</Text>
        </View>
        <Text style={styles.labelText}>Completed</Text>
      </View>

      {/* Cell 3: Average Response Time */}
      <View style={styles.cell}>
        <View style={styles.valueWithUnit}>
          <Text style={styles.valueText}>~{avgResponseMins || 15}</Text>
          <Text style={styles.unitText}>min</Text>
        </View>
        <Text style={styles.labelText}>Response</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bgSection || '#F9FAFB',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border || '#E5E7EB',
    width: '100%',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  middleBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border || '#E5E7EB',
  },
  valueText: {
    fontFamily: typography.fontFamily.inter.bold,
    fontSize: 20,
    color: colors.textPrimary || '#0F172A',
  },
  valueWithUnit: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unitText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted || '#6B7280',
    marginLeft: 2,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  starSpacing: {
    marginLeft: 2,
  },
  labelText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted || '#6B7280',
    marginTop: 2,
  },
});
