import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Section } from '../layout/Section';
import { WorkerSearchCard } from '../worker/WorkerSearchCard';
import { SkeletonWorkerSearchCard } from '../ui/Skeleton';
import { useInfiniteWorkers } from '../../hooks/useInfiniteWorkers';
import { WorkerNearby } from '../../types/worker.types';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { radius } from '../../design/radius';

// ─── Constants ────────────────────────────────────────────────────────────────
const INITIAL_VISIBLE_COUNT = 6;
const PAGE_LIMIT = 20;

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AllWorkersSectionProps {
  /** Optional category filter to scope the list */
  category?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export const AllWorkersSection: React.FC<AllWorkersSectionProps> = ({
  category,
}) => {
  const router = useRouter();

  const workerParams: Parameters<typeof useInfiniteWorkers>[0] = {
    limit: PAGE_LIMIT,
  };
  if (category) workerParams.category = category;

  const {
    workers,
    total,
    isLoading,
    isLoadingMore,
    hasNextPage,
    loadMore,
    refetch,
    isError,
  } = useInfiniteWorkers(workerParams);

  // Track how many workers are currently rendered (for "Show More" within
  // the outer ScrollView — avoids nested scroll issues).
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const handleShowMore = useCallback(() => {
    const nextVisible = visibleCount + PAGE_LIMIT;
    setVisibleCount(nextVisible);

    // If we've shown all locally fetched workers, fetch the next page
    if (nextVisible >= workers.length && hasNextPage && !isLoadingMore) {
      loadMore();
    }
  }, [visibleCount, workers.length, hasNextPage, isLoadingMore, loadMore]);

  const handleSeeAll = useCallback(() => {
    router.push('/(tabs)/explore' as any);
  }, [router]);

  // ── Render: skeletons while loading ──────────────────────────────────────
  if (isLoading) {
    return (
      <Section
        title="All Workers"
        actionLabel="See all →"
        onAction={handleSeeAll}
      >
        <View style={styles.listContainer}>
          {Array.from({ length: INITIAL_VISIBLE_COUNT }).map((_, i) => (
            <SkeletonWorkerSearchCard key={`skel-${i}`} />
          ))}
        </View>
      </Section>
    );
  }

  // ── Render: API error ─────────────────────────────────────────────────────
  if (isError) {
    return (
      <Section
        title="All Workers"
        actionLabel="See all →"
        onAction={handleSeeAll}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Couldn't load workers.</Text>
          <Pressable onPress={() => refetch()} hitSlop={12}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </Section>
    );
  }

  // ── Render: empty state ───────────────────────────────────────────────────
  if (!isLoading && workers.length === 0) {
    return (
      <Section
        title="All Workers"
        actionLabel="See all →"
        onAction={handleSeeAll}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No workers found</Text>
          <Text style={styles.emptySubtitle}>
            Check back later or explore a different category.
          </Text>
        </View>
      </Section>
    );
  }

  // The visible slice of workers to render
  const visibleWorkers: WorkerNearby[] = workers.slice(0, visibleCount);
  const hasMoreToShow =
    visibleCount < workers.length || (hasNextPage && !isLoadingMore);

  // ── Render: worker list ───────────────────────────────────────────────────
  return (
    <Section
      title="All Workers"
      actionLabel="See all →"
      onAction={handleSeeAll}
    >
      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{total} workers available</Text>
      </View>

      {/* Worker cards rendered inline (no nested scroll) */}
      <View style={styles.listContainer}>
        {visibleWorkers.map((worker) => (
          <WorkerSearchCard key={worker.id} worker={worker} />
        ))}
      </View>

      {/* Loading more skeletons */}
      {isLoadingMore && (
        <View style={styles.loadMoreSkeletons}>
          <SkeletonWorkerSearchCard />
          <SkeletonWorkerSearchCard />
        </View>
      )}

      {/* Show More / Load More button */}
      {hasMoreToShow && !isLoadingMore && (
        <Pressable
          onPress={handleShowMore}
          style={({ pressed }) => [
            styles.showMoreButton,
            pressed && styles.showMorePressed,
          ]}
        >
          <Text style={styles.showMoreLabel}>Show more workers</Text>
        </Pressable>
      )}

      {/* End of list indicator */}
      {!hasMoreToShow && !isLoadingMore && workers.length > INITIAL_VISIBLE_COUNT && (
        <View style={styles.endOfList}>
          <View style={styles.endLine} />
          <Text style={styles.endText}>You've seen all workers</Text>
          <View style={styles.endLine} />
        </View>
      )}
    </Section>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    gap: 0, // WorkerSearchCard already has marginBottom: 10
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsCount: {
    fontFamily: typography.fontFamily.inter.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  errorText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  retryText: {
    fontFamily: typography.fontFamily.jakarta.medium,
    fontSize: 13,
    color: colors.primary,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loadMoreSkeletons: {
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 4,
  },
  showMoreButton: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  showMorePressed: {
    opacity: 0.7,
    backgroundColor: colors.bgInput,
  },
  showMoreLabel: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  endOfList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    gap: 10,
  },
  endLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  endText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
