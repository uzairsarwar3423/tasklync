import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ViewStyle, Pressable } from 'react-native';
import { ReviewSummaryData } from '../../types/review.types';
import { ReviewStarRow } from './ReviewStarRow';
import { RatingBarRow } from './RatingBarRow';
import { colors } from '../../design/colors';
import { fontFamily as fonts } from '../../design/typography';

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
        </View>
        <Text style={styles.compactTotalText}>
          ({summary.totalReviews} reviews)
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {/* 1. Top Aggregate Block */}
      <View style={styles.topBlock}>
        <View style={styles.ratingScoreCol}>
          <Text style={styles.largeScoreText}>{summary.avgRating.toFixed(1)}</Text>
          <ReviewStarRow rating={summary.avgRating} size="sm" />
          <Text style={styles.totalReviewsText}>
            Based on {summary.totalReviews} reviews
          </Text>
        </View>

        {/* 2. Subcategory Rating Bars */}
        <View style={styles.barsCol}>
          {summary.avgPunctuality !== null && (
            <RatingBarRow
              label="Punctuality"
              value={summary.avgPunctuality}
              animated={animated}
              animationDelay={0}
            />
          )}
          {summary.avgQuality !== null && (
            <RatingBarRow
              label="Quality"
              value={summary.avgQuality}
              animated={animated}
              animationDelay={60}
            />
          )}
          {summary.avgCommunication !== null && (
            <RatingBarRow
              label="Communication"
              value={summary.avgCommunication}
              animated={animated}
              animationDelay={120}
            />
          )}
          {summary.avgValue !== null && (
            <RatingBarRow
              label="Value"
              value={summary.avgValue}
              animated={animated}
              animationDelay={180}
            />
          )}
        </View>
      </View>

      {/* 3. View All Button */}
      {onViewAll && (
        <Pressable onPress={onViewAll} hitSlop={8} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>
            See all {summary.totalReviews} reviews
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingScoreCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  largeScoreText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 32,
    color: colors.textPrimary,
    lineHeight: 38,
  },
  totalReviewsText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  barsCol: {
    flex: 1,
    gap: 6,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactRatingText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  compactTotalText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  viewAllButton: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewAllText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.primaryDark,
  },
});
