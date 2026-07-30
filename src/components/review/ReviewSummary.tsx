import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, ViewStyle, Pressable } from 'react-native';
import { ReviewSummaryData } from '../../types/review.types';
import { ReviewStarRow } from './ReviewStarRow';
import { RatingBarRow } from './RatingBarRow';
import { colors } from '@design/colors';
import { fontFamily as fonts } from '@design/typography';

interface ReviewSummaryProps {
  summary?: ReviewSummaryData | undefined;
  onViewAll?: () => void;
  style?: ViewStyle;
  compact?: boolean;
  animated?: boolean;
  onLayout?: (e: any) => void;
}

export const ReviewSummary = ({
  summary,
  onViewAll,
  style,
  compact = false,
  animated = false,
  onLayout,
}: ReviewSummaryProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (animated && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [animated, hasAnimated]);

  if (!summary) return null;

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]} onLayout={onLayout}>
        <View style={styles.compactLeft}>
          <Text style={styles.compactRatingText}>{summary.avgRating.toFixed(1)}</Text>
          <ReviewStarRow rating={summary.avgRating} size="xs" />
          <Text style={styles.compactCountText}>({summary.totalReviews})</Text>
        </View>
        {onViewAll && (
          <Pressable onPress={onViewAll} hitSlop={12}>
            <Text style={styles.viewAllText}>See all {summary.totalReviews} →</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const shouldAnimate = animated || hasAnimated;

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Reviews</Text>
        {onViewAll && summary.totalReviews > 0 && (
          <Pressable onPress={onViewAll} hitSlop={12}>
            <Text style={styles.viewAllText}>See all {summary.totalReviews} →</Text>
          </Pressable>
        )}
      </View>

      {/* Overall Block */}
      <View style={styles.overallBlock}>
        <Text style={styles.overallNumber}>{summary.avgRating.toFixed(1)}</Text>
        <ReviewStarRow rating={summary.avgRating} size="md" />
        <Text style={styles.overallCount}>({summary.totalReviews} reviews)</Text>
      </View>

      <View style={styles.divider} />

      {/* Breakdown */}
      <View style={styles.breakdownBlock}>
        <RatingBarRow
          label="Punctuality"
          value={summary.avgPunctuality}
          animated={shouldAnimate}
          animationDelay={0}
        />
        <RatingBarRow
          label="Quality"
          value={summary.avgQuality}
          animated={shouldAnimate}
          animationDelay={80}
        />
        <RatingBarRow
          label="Communication"
          value={summary.avgCommunication}
          animated={shouldAnimate}
          animationDelay={160}
        />
        <RatingBarRow
          label="Value"
          value={summary.avgValue}
          animated={shouldAnimate}
          animationDelay={240}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: colors.bgCard,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactRatingText: {
    fontFamily: fonts.inter.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  compactCountText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: fonts.poppins.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  viewAllText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.primary,
  },
  overallBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  overallNumber: {
    fontFamily: fonts.inter.bold,
    fontSize: 36,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  overallCount: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  breakdownBlock: {
    gap: 4,
  },
});
