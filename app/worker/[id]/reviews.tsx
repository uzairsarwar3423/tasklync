import React, { useState } from 'react';
import { StyleSheet, View, Text, RefreshControl, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react-native';

import { useWorkerReviews } from '../../../src/hooks/useWorkerReviews';
import { ReviewSummary } from '../../../src/components/review/ReviewSummary';
import { ReviewCard } from '../../../src/components/review/ReviewCard';
import { SkeletonReviewCard } from '../../../src/components/ui/Skeleton';
// If ActionSheet is available, we would import it here, otherwise we'll mock it for now.
// import { ActionSheet } from '../../../src/components/ui/ActionSheet';
import { ReviewSortOption } from '../../../src/types';

import { colors } from '@design/colors';
import { shadows } from '@design/shadows';
import { fontFamily as fonts } from '@design/typography';

const AnyFlashList = FlashList as any;

export default function WorkerReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [sortBy, setSortBy] = useState<ReviewSortOption>('recent');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const {
    reviews,
    summary,
    total,
    isLoading,
    isLoadingMore,
    hasNextPage,
    loadMore,
    refetch,
  } = useWorkerReviews(id || '', sortBy);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <ReviewCard
      review={item}
      showReply={true}
      showWorkInfo={true}
      maxCommentLines={3}
    />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <SkeletonReviewCard />
          <SkeletonReviewCard />
          <SkeletonReviewCard />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reviews yet</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerContainer}>
          <SkeletonReviewCard />
          <SkeletonReviewCard />
        </View>
      );
    }
    if (!hasNextPage && reviews.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.endText}>All {total} reviews shown</Text>
        </View>
      );
    }
    return <View style={{ height: 40 }} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(id ? `/worker/${id}` as any : '/(tabs)/' as any);
            }
          }} 
          hitSlop={12} 
          style={styles.iconButton}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Reviews</Text>
        <Pressable onPress={() => setIsSortOpen(true)} hitSlop={12} style={styles.iconButton}>
          <SlidersHorizontal size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Sticky Summary */}
      <View style={styles.stickySummaryWrapper}>
        <ReviewSummary
          summary={summary}
          compact={true}
          style={styles.stickySummary}
        />
      </View>

      {/* FlashList */}
      <AnyFlashList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.id}
        estimatedItemSize={140}
        onEndReached={hasNextPage ? loadMore : null}
        onEndReachedThreshold={0.6}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FAFAFA', // colors.bgApp
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 44 : 56,
    backgroundColor: colors.bgCard,
    ...shadows.sm,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  stickySummaryWrapper: {
    backgroundColor: colors.bgCard,
    ...shadows.sm,
    zIndex: 9,
  },
  stickySummary: {
    // Styles inside ReviewSummary compact already handle it mostly
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 16,
    color: colors.textMuted,
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
