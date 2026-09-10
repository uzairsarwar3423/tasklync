import { useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSharedValue } from 'react-native-reanimated';
import { SearchHeader } from '../../src/components/home/SearchHeader';
import { BottomSheet, BottomSheetRef } from '../../src/components/layout/BottomSheet';
import { FilterSheetContent } from '../../src/components/search/FilterSheetContent';
import { RecentSearchesSection } from '../../src/components/search/RecentSearchesSection';
import { WorkerSearchCard } from '../../src/components/worker/WorkerSearchCard';
import { SkeletonWorkerSearchCard } from '../../src/components/ui/Skeleton';
import { ChipGroup, Chip } from '../../src/components/ui/Chip';
import { ErrorState } from '../../src/components/feedback/ErrorState';
import { useSearch } from '../../src/hooks/useSearch';
import { useRecentSearches } from '../../src/hooks/useRecentSearches';
import { colors } from '../../src/design/colors';
import { typography } from '../../src/design/typography';
import { DEFAULT_FILTERS } from '../../src/types/search.types';
import { Search, X } from 'lucide-react-native';

export default function ExploreScreen() {
  const scrollY = useSharedValue(0);
  const filterSheetRef = useRef<BottomSheetRef>(null);

  const {
    query,
    setQuery,
    debouncedQuery,
    filters,
    setFilters,
    resetFilters,
    activeFilterCount,
    workers,
    total,
    isLoading,
    isLoadingMore,
    isError,
    refetch,
    hasMore,
    loadMore,
    clearSearch,
  } = useSearch();

  const {
    searches,
    addSearch,
    removeSearch,
    clearAll,
  } = useRecentSearches();

  const handleRecentSearchSelect = (term: string) => {
    setQuery(term);
    addSearch(term);
  };

  const handleFilterApply = (newFilters: any) => {
    setFilters(newFilters);
    filterSheetRef.current?.close();
  };

  const handleFilterReset = () => {
    resetFilters();
    filterSheetRef.current?.close();
  };

  const removeFilter = (key: keyof typeof filters, value?: any) => {
    if (key === 'categories' && value) {
      setFilters({ ...filters, categories: (filters?.categories || []).filter(c => c !== value) });
    } else {
      setFilters({ ...filters, [key]: DEFAULT_FILTERS[key] });
    }
  };

  const renderActiveFilters = () => {
    if (activeFilterCount === 0) return null;

    const safeCategories = filters?.categories || [];

    return (
      <View style={styles.activeFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
          {safeCategories.map(cat => (
            <Chip
              key={cat}
              label={`Category: ${cat}`}
              variant="tag"
              size="sm"
              trailingIcon={X}
              onTrailingPress={() => removeFilter('categories', cat)}
              style={styles.activeFilterChip}
            />
          ))}
          {filters.minRating > 0 && (
             <Chip
             key="rating"
             label={`${filters.minRating}★ & up`}
             variant="tag"
             size="sm"
             trailingIcon={X}
             onTrailingPress={() => removeFilter('minRating')}
             style={styles.activeFilterChip}
           />
          )}
          {filters.available !== 'any' && (
             <Chip
             key="avail"
             label={filters.available === 'now' ? 'Available now' : 'Available today'}
             variant="tag"
             size="sm"
             trailingIcon={X}
             onTrailingPress={() => removeFilter('available')}
             style={styles.activeFilterChip}
           />
          )}
          {filters.sortBy !== 'distance' && (
             <Chip
             key="sort"
             label={`Sort: ${filters.sortBy}`}
             variant="tag"
             size="sm"
             trailingIcon={X}
             onTrailingPress={() => removeFilter('sortBy')}
             style={styles.activeFilterChip}
           />
          )}
        </ScrollView>
      </View>
    );
  };

  const renderEmptyQueryState = () => {
    return (
      <View style={styles.emptyQueryContainer}>
        <RecentSearchesSection
          searches={searches}
          onSelect={handleRecentSearchSelect}
          onRemove={removeSearch}
          onClearAll={clearAll}
        />

        <View style={styles.browseSection}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <ChipGroup
            options={[
              { label: 'Electrician', value: 'Electrician' },
              { label: 'Plumber', value: 'Plumber' },
              { label: 'Cleaning', value: 'Cleaning' },
              { label: 'Painter', value: 'Painter' },
            ]}
            selected=""
            onSelect={(cat) => {
              setQuery(cat);
              addSearch(cat);
            }}
            multiSelect={false}
            scrollable={false}
          />
        </View>

        <View style={styles.browseSection}>
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          {['AC Repair', 'Deep Cleaning', 'Geyser Repair'].map(term => (
            <Pressable key={term} style={styles.popularRow} onPress={() => handleRecentSearchSelect(term)}>
              <Search size={16} color={colors.textMuted} />
              <Text style={styles.popularText}>{term}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderEmptyResults = () => {
    if (isLoading) return null; // handled by ListEmptyComponent
    return (
      <View style={styles.emptyResultsContainer}>
        <View style={styles.emptyIconContainer}>
          <Search size={40} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No workers found</Text>
        <Text style={styles.emptySub}>Try different terms or adjust filters</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SearchHeader
        value={query}
        onChangeText={setQuery}
        onClear={clearSearch}
        activeFilterCount={activeFilterCount}
        onFilterPress={() => filterSheetRef.current?.open()}
        scrollY={scrollY}
      />

      {renderActiveFilters()}

      {debouncedQuery.length < 2 && activeFilterCount === 0 ? (
        <ScrollView style={styles.listContainer} onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }} scrollEventThrottle={16}>
          {renderEmptyQueryState()}
        </ScrollView>
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            data={workers}
            renderItem={({ item }) => <WorkerSearchCard worker={item} />}
            keyExtractor={(item) => item.id}
            // @ts-ignore - estimatedItemSize exists but TS is complaining due to version mismatch
            estimatedItemSize={96}
            contentContainerStyle={styles.flashListContent}
            onScroll={(e) => {
              scrollY.value = e.nativeEvent.contentOffset.y;
            }}
            onEndReached={() => {
              if (hasMore && !isLoadingMore) loadMore();
            }}
            onEndReachedThreshold={0.8}
            ListHeaderComponent={
              !isLoading ? (
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>{total} workers found</Text>
                  <View style={styles.sortRow}>
                    <ChipGroup
                      options={[
                        { label: 'Nearest', value: 'distance' },
                        { label: 'Top Rated', value: 'rating' },
                        { label: 'Lowest Price', value: 'price_low' },
                      ]}
                      selected={filters.sortBy}
                      onSelect={(val) => setFilters({ ...filters, sortBy: val as any })}
                      scrollable
                      paddingH={0}
                      chipSize="sm"
                    />
                  </View>
                </View>
              ) : null
            }
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.skeletonContainer}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonWorkerSearchCard key={i} />
                  ))}
                </View>
              ) : isError ? (
                <ErrorState
                  type="error"
                  title="Couldn't load workers"
                  subtitle="Please check your internet connection and try again."
                  onRetry={refetch}
                  retryButtonText="Retry"
                  style={{ paddingVertical: 40 }}
                />
              ) : (
                renderEmptyResults()
              )
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.skeletonContainer}>
                  {[1, 2].map((i) => (
                    <SkeletonWorkerSearchCard key={i} />
                  ))}
                </View>
              ) : null
            }
          />
        </View>
      )}

      <BottomSheet
        ref={filterSheetRef}
        snapPoints={['85%']}
        contentPadding={false}
      >
        <FilterSheetContent
          filters={filters}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
          resultCount={total}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  activeFiltersContainer: {
    backgroundColor: colors.bgCard,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activeFiltersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  activeFilterChip: {
    backgroundColor: colors.bgSection, // distinguish from input bg slightly
  },
  listContainer: {
    flex: 1,
  },
  emptyQueryContainer: {
    paddingBottom: 40,
  },
  browseSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  popularText: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  flashListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontFamily: typography.fontFamily.inter.medium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  sortRow: {
    // optional spacing if needed
  },
  skeletonContainer: {
    gap: 10,
  },
  emptyResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgSection,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
