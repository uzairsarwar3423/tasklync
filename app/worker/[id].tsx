import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Share, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useWorkerProfile } from '@hooks/useWorkerProfile';
import { useWorkerReviews } from '@hooks/useWorkerReviews';
import { useWorkerPortfolio } from '@hooks/useWorkerPortfolio';
import { WorkerProfileHeader } from '@components/worker/WorkerProfileHeader';
import { WorkerCompactHeader } from '@components/worker/WorkerCompactHeader';
import { VerifiedBadge } from '@components/worker/VerifiedBadge';
import { WorkerAvailabilityCard } from '@components/worker/WorkerAvailabilityCard';
import { WorkerStats } from '@components/worker/WorkerStats';
import { WorkerBio } from '@components/worker/WorkerBio';
import { WorkerSkillList } from '@components/worker/WorkerSkillList';
import { WorkerServicesSection } from '@components/worker/WorkerServicesSection';
import { WorkerProfileStickyFooter } from '@components/worker/WorkerProfileStickyFooter';
import { MoreOptionsMenu } from '@components/worker/MoreOptionsMenu';
import { WorkerSocialProof } from '@components/worker/WorkerSocialProof';
import { WorkerPortfolioGrid } from '@components/worker/WorkerPortfolioGrid';
import { ReviewSummary } from '@components/review/ReviewSummary';
import { ReviewCard } from '@components/review/ReviewCard';
import { SectionDivider } from '@components/ui/Divider';
import { ImageViewer } from '@components/common/ImageViewer';
import { BlockWorkerSheet } from '../../src/components/worker/BlockWorkerSheet';
import { useBlockWorker } from '../../src/hooks/useBlockWorker';
import { getPersistedBookings } from '../../src/services/api/booking.api';

import {
  SkeletonWorkerProfileHero,
  SkeletonWorkerStats,
  SkeletonWorkerBio,
  SkeletonWorkerSkillList,
  SkeletonWorkerServiceRow,
  SkeletonReviewSummary,
  SkeletonPortfolioGrid,
  SkeletonReviewCard,
} from '@components/ui/Skeleton';

import { colors } from '@design/colors';
import { radius } from '@design/radius';
import { typography } from '@design/typography';

export default function WorkerProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const scrollY = useSharedValue(0);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [blockSheetVisible, setBlockSheetVisible] = useState(false);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  const blockWorkerMutation = useBlockWorker();

  const { worker, skills, services, isLoading, isError, refetch } = useWorkerProfile(id || '');
  const { reviews: previewReviews, summary } = useWorkerReviews(id || '');
  const { images: portfolioImages } = useWorkerPortfolio(id || '');

  const hasActiveBooking = Boolean(
    getPersistedBookings().find(
      (b) => b.worker_id === id && (b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS' || b.status === 'PENDING')
    )
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/' as any);
    }
  };

  const handleShare = async () => {
    if (!worker) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Share.share({
        message: `Check out ${worker.name} on Tasklync! Providing expert home services.`,
        url: `https://tasklync.com/worker/${worker.id}`,
      });
    } catch (error) {
      console.error('Error sharing profile', error);
    }
  };

  const handleMore = () => {
    setOptionsVisible(true);
  };

  const handleCloseOptions = () => {
    setOptionsVisible(false);
  };

  const handleReport = () => {
    setOptionsVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Report Worker', 'Thank you for reporting. Our safety team will review this profile immediately.');
  };

  const handleBlock = () => {
    setOptionsVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBlockSheetVisible(true);
  };

  const handleChat = () => {
    Haptics.selectionAsync();
    const existing = getPersistedBookings().find(
      (b) => b.worker_id === id && (b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS' || b.status === 'PENDING')
    );
    if (existing) {
      router.push({
        pathname: `/booking/${existing.id}/chat`,
        params: {
          workerName: worker?.name || existing.worker_name,
          workerAvatar: worker?.avatar_url || existing.worker_avatar_url,
          workerPhone: worker?.phone_number || existing.worker_phone,
          workerId: worker?.id || existing.worker_id,
        },
      } as any);
    } else {
      Alert.alert(
        'Direct Chat',
        `Direct chat with ${worker?.name || 'this worker'} is enabled once you book a service.`
      );
    }
  };

  const handleBookNow = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Book Now', `Proceed to checkout with ${worker?.name || 'worker'}?`);
  };

  const handleRatingPress = () => {
    router.push(`/worker/${id}/reviews`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SkeletonWorkerProfileHero />
          <View style={[styles.contentCard, { marginTop: -24 }]}>
            <SkeletonWorkerStats />
            <View style={styles.sectionSpacer} />
            <SkeletonWorkerBio />
            <View style={styles.sectionSpacer} />
            <SkeletonWorkerSkillList />
            <View style={styles.sectionSpacer} />
            <View style={styles.servicesHeaderSkeleton}>
              <SkeletonWorkerServiceRow />
              <SkeletonWorkerServiceRow />
            </View>
            <View style={styles.sectionSpacer} />
            <SkeletonPortfolioGrid />
            <View style={styles.sectionSpacer} />
            <SkeletonReviewSummary />
            <SkeletonReviewCard />
            <SkeletonReviewCard />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !worker) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top', 'bottom']}>
        <Text style={styles.errorText}>Worker profile not found</Text>
        <Text style={styles.errorSubtext} onPress={() => refetch()}>Tap here to retry</Text>
      </SafeAreaView>
    );
  }

  const isAvailable = worker.availabilityStatus === 'AVAILABLE';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Sticky Compact Header (Visible past scroll offset) */}
      <WorkerCompactHeader
        worker={worker}
        scrollY={scrollY}
        onBack={handleBack}
        onBookNow={handleBookNow}
      />

      {/* Main Scroll Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Parallax Hero Header */}
        <WorkerProfileHeader
          worker={worker}
          scrollY={scrollY}
          onBack={handleBack}
          onShare={handleShare}
          onMore={handleMore}
        />

        {/* Content Card Overlapping Hero */}
        <View style={styles.contentCard}>
          {/* Trust Row: Verified badge & availability card */}
          <View style={styles.trustRow}>
            {worker.isVerified && (
              <VerifiedBadge size="md" style={styles.verifiedBadge} />
            )}
            <WorkerAvailabilityCard
              status={worker.availabilityStatus}
              availableUntil={worker.availableUntil}
              avgResponseMins={worker.responseTimeMins}
            />
          </View>

          {/* Stats Grid */}
          <WorkerStats
            rating={worker.avgRating}
            totalReviews={worker.totalReviews}
            totalJobs={worker.totalBookings}
            avgResponseMins={worker.responseTimeMins}
            onRatingPress={handleRatingPress}
            style={styles.statsCard}
          />
          
          <WorkerSocialProof
            jobCount={worker.totalBookings}
            city={worker.city}
            style={{ marginBottom: 20 }}
          />

          <View style={styles.divider} />

          {/* About Bio */}
          <WorkerBio bio={worker.bio} style={styles.bioSection} />

          <View style={styles.divider} />

          {/* Skills Tag Cloud */}
          <WorkerSkillList skills={skills} style={styles.skillsSection} />

          <View style={styles.divider} />

          {/* Services Rows list */}
          <WorkerServicesSection
            services={services}
            workerId={worker.id}
            workerName={worker.name}
            workerAvatar={worker.avatarUrl}
            workerRating={worker.avgRating}
            workerCategory={worker.categories?.[0]}
            workerVerified={worker.isVerified}
            startingPrice={worker.startingPrice}
            style={styles.servicesSection}
          />

          <SectionDivider marginV={8} />

          <WorkerPortfolioGrid
            images={portfolioImages.slice(0, 6)}
            workerId={worker.id}
            maxVisible={6}
            onViewAll={() => router.push(`/worker/${id}/portfolio`)}
            onImagePress={(images, index) => {
              setViewerStartIndex(index);
              setViewerVisible(true);
            }}
            showHeader={true}
          />

          <SectionDivider marginV={8} />

          <ReviewSummary
            summary={summary}
            onViewAll={() => router.push(`/worker/${id}/reviews`)}
          />

          {previewReviews.slice(0, 3).map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showReply={true}
              maxCommentLines={3}
            />
          ))}

          {summary && summary.totalReviews > 3 && (
            <Pressable
              onPress={() => router.push(`/worker/${id}/reviews`)}
              hitSlop={12}
              style={{ marginVertical: 8, alignSelf: 'center' }}
            >
              <Text style={{ fontFamily: typography.fontFamily.jakarta.semiBold, fontSize: 14, color: colors.primary }}>
                See all {summary.totalReviews} reviews →
              </Text>
            </Pressable>
          )}

          {/* Space for bottom sticky footer padding */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Floating Action Sticky Footer */}
      <WorkerProfileStickyFooter
        workerId={worker.id}
        workerName={worker.name}
        onChat={handleChat}
        onBookNow={handleBookNow}
        isWorkerAvailable={isAvailable}
      />

      {/* Options Actions Sheet Menu */}
      <MoreOptionsMenu
        workerId={worker.id}
        workerName={worker.name}
        isVisible={optionsVisible}
        onClose={handleCloseOptions}
        onReport={handleReport}
        onBlock={handleBlock}
        onShare={handleShare}
      />

      <ImageViewer
        images={portfolioImages}
        initialIndex={viewerStartIndex}
        isVisible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />

      {worker && (
        <BlockWorkerSheet
          visible={blockSheetVisible}
          workerId={worker.id}
          workerName={worker.name}
          hasActiveBooking={hasActiveBooking}
          onClose={() => setBlockSheetVisible(false)}
          onBlock={async (workerId, reason) => {
            await blockWorkerMutation.mutateAsync({ workerId, reason });
          }}
          isLoading={blockWorkerMutation.isPending}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  trustRow: {
    marginBottom: 20,
    width: '100%',
  },
  verifiedBadge: {
    marginBottom: 10,
  },
  statsCard: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border || '#E5E7EB',
    marginVertical: 20,
    width: '100%',
  },
  bioSection: {
    width: '100%',
  },
  skillsSection: {
    width: '100%',
  },
  servicesSection: {
    width: '100%',
  },
  sectionSpacer: {
    height: 24,
  },
  servicesHeaderSkeleton: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 16,
    color: colors.textPrimary || '#0F172A',
  },
  errorSubtext: {
    fontFamily: typography.fontFamily.jakarta.medium,
    fontSize: 14,
    color: colors.primary || '#16A34A',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});
