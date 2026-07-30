import React, { useState } from 'react';
import { View, StyleSheet, Text, ViewStyle, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { WorkerReview } from '../../types/review.types';
import { ReviewMetaRow } from './ReviewMetaRow';
import { ReviewStarRow } from './ReviewStarRow';
import { ReviewReplyBubble } from './ReviewReplyBubble';
import { Chip } from '../ui/Chip';
import { colors } from '@design/colors';
import { fontFamily as fonts } from '@design/typography';
import { radius } from '@design/radius';
import { shadows } from '@design/shadows';

interface ReviewCardProps {
  review: WorkerReview;
  maxCommentLines?: number;
  showReply?: boolean;
  showWorkInfo?: boolean;
  style?: ViewStyle;
}

const springConfig = {
  damping: 20,
  stiffness: 90,
  mass: 1,
};

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
    Haptics.selectionAsync();
    setIsExpanded(!isExpanded);
  };

  return (
    <Pressable 
      onPress={toggleExpand} 
      disabled={!isTruncated && !isExpanded}
      style={({ pressed }) => [
        styles.container, 
        style,
        pressed && (isTruncated || isExpanded) ? styles.pressed : null
      ]}
    >
      <ReviewMetaRow
        avatarUrl={review.reviewerAvatar}
        reviewerName={review.reviewerName}
        date={review.createdAt}
        isVerified={review.isVerified}
        style={styles.metaRow}
      />

      <View style={styles.starsRow}>
        <ReviewStarRow rating={review.rating} size="sm" />
        {showWorkInfo && review.bookingId && (
          // In a real app we'd resolve the bookingId to a service name.
          // For now just showing a static text to match the design or assuming it's available.
          <Text style={styles.workInfoText} numberOfLines={1}>
            Service Booked
          </Text>
        )}
      </View>

      {review.comment ? (
        <View style={styles.commentContainer}>
          <Text
            style={styles.commentText}
            numberOfLines={isExpanded ? undefined : maxCommentLines}
            onTextLayout={(e) => {
              if (e.nativeEvent.lines.length > maxCommentLines) {
                setIsTruncated(true);
              }
            }}
          >
            {review.comment}
          </Text>
          {(isTruncated || isExpanded) && (
            <Text style={styles.readMoreText}>
              {isExpanded ? 'Show less ↑' : 'Read more →'}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.emptyCommentText}>
          No written review
        </Text>
      )}

      {showWorkInfo && (
        <View style={styles.serviceTagContainer}>
           <Chip 
             label="Service Category" 
             variant="filter" // or tag if it exists in Day 6
             onPress={() => {}} 
             style={styles.serviceTag}
           />
        </View>
      )}

      {showReply && review.reply && (
        <ReviewReplyBubble
          reply={review.reply}
          workerName="Worker" // Real app would use context or prop
          repliedAt={review.repliedAt}
          style={styles.replyBubble}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    ...shadows.xs,
  },
  pressed: {
    opacity: 0.9,
  },
  metaRow: {
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workInfoText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  commentContainer: {
    marginTop: 4,
  },
  commentText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  readMoreText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
  },
  emptyCommentText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  serviceTagContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  serviceTag: {
    transform: [{ scale: 0.9 }],
  },
  replyBubble: {
    marginTop: 10,
  },
});
