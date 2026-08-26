import { useState } from 'react';
import { View, StyleSheet, Text, ViewStyle, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { WorkerReview } from '../../types/review.types';
import { ReviewMetaRow } from './ReviewMetaRow';
import { ReviewStarRow } from './ReviewStarRow';
import { ReviewReplyBubble } from './ReviewReplyBubble';
import { Chip } from '../ui/Chip';
import { colors } from '../../design/colors';
import { fontFamily as fonts } from '../../design/typography';
import { radius } from '../../design/radius';
import { shadows } from '../../design/shadows';

interface ReviewCardProps {
  review: WorkerReview;
  maxCommentLines?: number;
  showReply?: boolean;
  showWorkInfo?: boolean;
  style?: ViewStyle;
}

export const ReviewCard = ({
  review,
  maxCommentLines = 3,
  showReply = true,
  showWorkInfo = false,
  style,
}: ReviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  const toggleExpand = () => {
    if (!isTruncated && !isExpanded) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsExpanded((prev) => !prev);
  };

  const handleTextLayout = (e: any) => {
    if (e.nativeEvent.lines.length > maxCommentLines) {
      setIsTruncated(true);
    }
  };

  return (
    <View style={[styles.card, style]}>
      {/* 1. Review Meta (Avatar, Name, Verified, Date) */}
      <ReviewMetaRow
        avatarUrl={review.reviewerAvatar}
        reviewerName={review.reviewerName}
        date={review.createdAt}
        isVerified={review.isVerified}
        size="md"
      />

      {/* 2. Rating Star Breakdown */}
      <ReviewStarRow
        rating={review.rating}
        punctuality={review.punctuality}
        quality={review.quality}
        communication={review.communication}
        value={review.value}
        style={styles.starRow}
      />

      {/* 3. Review Comment */}
      {review.comment && (
        <View style={styles.commentContainer}>
          <Text
            style={styles.commentText}
            numberOfLines={isExpanded ? undefined : maxCommentLines}
            onTextLayout={!isTruncated ? handleTextLayout : undefined}
          >
            {review.comment}
          </Text>

          {(isTruncated || isExpanded) && (
            <Pressable
              onPress={toggleExpand}
              hitSlop={8}
              style={styles.readMoreButton}
            >
              <Text style={styles.readMoreText}>
                {isExpanded ? 'Show less' : 'Read more'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* 4. Optional Service Info Chip */}
      {showWorkInfo && review.serviceName && (
        <View style={styles.serviceChipContainer}>
          <Chip label={review.serviceName} size="sm" variant="tag" />
        </View>
      )}

      {/* 5. Worker Reply Bubble */}
      {showReply && review.reply && (
        <ReviewReplyBubble
          reply={review.reply}
          repliedAt={review.repliedAt}
          workerName="Service Provider"
          style={styles.replyBubble}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  starRow: {
    marginTop: 12,
  },
  commentContainer: {
    marginTop: 10,
  },
  commentText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  readMoreButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.primaryDark,
  },
  serviceChipContainer: {
    marginTop: 12,
    flexDirection: 'row',
  },
  replyBubble: {
    marginTop: 14,
  },
});
