import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useBookingDetails } from '../../../src/hooks/useBookingDetails';
import { useReviewFormState } from '../../../src/hooks/useReviewFormState';
import { useSubmitReview } from '../../../src/hooks/useSubmitReview';
import { useSkipReview } from '../../../src/hooks/useSkipReview';
import { ReviewWorkerContext } from '../../../src/components/review/ReviewWorkerContext';
import { RatingInput } from '../../../src/components/ui/Rating/RatingInput';
import { CategoryRatingSection } from '../../../src/components/review/CategoryRatingSection';
import { ReviewCommentInput } from '../../../src/components/review/ReviewCommentInput';
import { ReviewSuccessState } from '../../../src/components/review/ReviewSuccessState';
import {
  colors,
  palette,
  fontFamily,
  fontSize,
  radius,
  shadows,
  spacing,
} from '../../../src/design';

/**
 * ReviewScreen (Day 33 Post-Booking Review Flow)
 *
 * Implements Principal-level React Native & UX Architecture:
 * - Progressive disclosure without layout reflow jank
 * - Strict Hick's Law validation: overall rating is hard-required, categories are soft-optional
 * - Timer-safe one-shot success replacement to prevent re-submission & navigation stack loops
 * - Fitts's Law 40px primary rating touch target
 * - Keyboard-safe layout with safe area insets
 */
export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id: bookingId } = useLocalSearchParams<{ id: string }>();

  const { booking, isLoading: isBookingLoading } = useBookingDetails(bookingId);
  const {
    overallRating,
    categoryRatings,
    comment,
    canSubmit,
    shouldShowCategorySection,
    setOverallRating,
    setCategoryRating,
    setComment,
  } = useReviewFormState();

  const { submitReview, isSubmitting } = useSubmitReview();
  const { skipReview } = useSkipReview(bookingId);

  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Navigation
  const handleNavigateAfterSuccess = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/bookings' as any);
    }
  }, [router]);

  // Submit Handler
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isSubmitting || !bookingId) return;

    try {
      setErrorMessage(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      const targetId = booking?.worker_id || 'worker_default';

      await submitReview({
        bookingId,
        targetId,
        targetType: 'worker',
        rating: overallRating,
        categories: categoryRatings,
        comment,
      });

      // Swap to one-shot success state
      setHasSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit review. Please try again.');
    }
  }, [
    booking?.worker_id,
    bookingId,
    canSubmit,
    categoryRatings,
    comment,
    isSubmitting,
    overallRating,
    submitReview,
  ]);

  // Render Success Payoff View
  if (hasSubmitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgCard} />
        <ReviewSuccessState onDismiss={handleNavigateAfterSuccess} />
      </View>
    );
  }

  const workerName = booking?.worker_name || 'Service Professional';
  const workerAvatar = booking?.worker_avatar_url || null;
  const serviceName = booking?.category_name || 'Home Service';
  const completedDate = booking?.completed_at || booking?.created_at;

  return (
    <KeyboardAvoidingView
      style={styles.flexOne}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgCard} />

        {/* Screen Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </Pressable>

          <Text style={styles.headerTitle}>Rate your experience</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {isBookingLoading && !booking ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: insets.bottom + 120 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* 1. Worker & Job Context Card */}
              <ReviewWorkerContext
                workerName={workerName}
                workerAvatar={workerAvatar}
                serviceName={serviceName}
                completedDate={completedDate}
              />

              {/* 2. Primary Overall Rating Section */}
              <View style={styles.primaryRatingCard}>
                <Text style={styles.primaryRatingTitle}>How was your experience?</Text>
                <Text style={styles.primaryRatingSubtitle}>
                  {overallRating === 0
                    ? 'Tap a star to rate the overall job'
                    : overallRating === 5
                    ? 'Outstanding! ⭐⭐⭐⭐⭐'
                    : overallRating === 4
                    ? 'Very Good! ⭐⭐⭐⭐'
                    : overallRating === 3
                    ? 'Average ⭐⭐⭐'
                    : overallRating === 2
                    ? 'Below expectations ⭐⭐'
                    : 'Needs improvement ⭐'}
                </Text>

                <View style={styles.ratingInputWrapper}>
                  <RatingInput
                    value={overallRating}
                    onChange={setOverallRating}
                    size="lg"
                    disabled={isSubmitting}
                  />
                </View>
              </View>

              {/* 3. Progressive Disclosure Category Details */}
              <CategoryRatingSection
                visible={shouldShowCategorySection}
                categoryRatings={categoryRatings}
                onCategoryRatingChange={setCategoryRating}
                disabled={isSubmitting}
              />

              {/* 4. Optional Written Feedback */}
              <ReviewCommentInput
                value={comment}
                onChangeText={setComment}
                disabled={isSubmitting}
              />

              {/* Error Banner */}
              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}
            </ScrollView>

            {/* Sticky Action Footer */}
            <View
              style={[
                styles.footer,
                { paddingBottom: Math.max(insets.bottom, 16) + 8 },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  !canSubmit && styles.submitButtonDisabled,
                  isSubmitting && styles.submitButtonLoading,
                  pressed && canSubmit && styles.submitButtonPressed,
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Submit Review"
                accessibilityState={{ disabled: !canSubmit || isSubmitting }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.textOnGreen} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.skipButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={skipReview}
                disabled={isSubmitting}
                hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
                accessibilityRole="button"
                accessibilityLabel="Skip review for now"
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray100,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgApp,
  },
  headerTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h3,
    color: colors.textPrimary,
  },
  headerPlaceholder: {
    width: 38,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryRatingCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  primaryRatingTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h4 + 1,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  primaryRatingSubtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.dataSM,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  ratingInputWrapper: {
    paddingVertical: spacing.xs / 2,
  },
  errorBanner: {
    backgroundColor: palette.dangerLight,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: palette.dangerLight,
    marginTop: spacing.md,
  },
  errorText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: fontSize.dataSM,
    color: colors.textDanger,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: palette.gray100,
    ...shadows.lg,
  },
  submitButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: palette.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonLoading: {
    opacity: 0.85,
  },
  submitButtonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.99 }],
  },
  submitButtonText: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.body1,
    color: colors.textOnGreen,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs / 2,
  },
  skipButtonText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: fontSize.dataSM + 0.5,
    color: colors.textSecondary,
  },
});
