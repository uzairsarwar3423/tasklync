import { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@design/colors';
import { typography } from '@design/typography';
import { useCategoryById } from '@hooks/useCategories';
import { TabToggle } from '@components/ui/Toggle';
import { CategoryFilterBar, CategoryServicesList, CategoryWorkersList } from '@components/category';
import { BottomSheet, BottomSheetRef } from '@components/layout/BottomSheet';
import { FilterSheetContent } from '@components/search/FilterSheetContent';
import { FilterState, SortOption, DEFAULT_FILTERS } from '../../src/types/search.types';

import { formatCategoryName } from '../../src/utils/formatters';

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Array.isArray(id) ? id[0] : id;

  // Fetch Category info & services
  const { category, isLoading: isCategoryLoading } = useCategoryById(categoryId || '');

  // Screen States
  const [selectedTab, setSelectedTab] = useState<'services' | 'workers'>('services');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categories: categoryId ? [categoryId] : [],
  });

  const sheetRef = useRef<BottomSheetRef>(null);

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/' as any);
    }
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value as 'services' | 'workers');
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setFilters((prev) => ({ ...prev, sortBy: newSort }));
  };

  const handleRemoveFilter = (key: keyof FilterState) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setFilters((prev) => {
      const updated = { ...prev };
      if (key === 'minRating') updated.minRating = 0;
      if (key === 'maxRate') updated.maxRate = 0;
      if (key === 'available') updated.available = 'any';
      return updated;
    });
  };

  const handleOpenFilters = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    sheetRef.current?.open();
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setSortBy(newFilters.sortBy);
    sheetRef.current?.close();
  };

  const handleResetFilters = () => {
    setFilters({
      ...DEFAULT_FILTERS,
      categories: categoryId ? [categoryId] : [],
    });
    setSortBy('distance');
    sheetRef.current?.close();
  };

  const categoryName = category?.name || formatCategoryName(categoryId, 'Category', 'title');

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.bgApp}
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ChevronLeft
            size={24}
            color={colors.primary}
          />
        </Pressable>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
        >
          {categoryName}
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Tabs Switcher Section */}
      <View style={styles.tabsContainer}>
        <TabToggle
          options={[
            { label: 'Services', value: 'services' },
            { label: 'Workers', value: 'workers' },
          ]}
          activeValue={selectedTab}
          onChange={handleTabChange}
        />
      </View>

      {/* Filter Bar (Only shown for workers list) */}
      {selectedTab === 'workers' && (
        <CategoryFilterBar
          sortBy={sortBy}
          onSortChange={handleSortChange}
          activeFilters={filters}
          onRemoveFilter={handleRemoveFilter}
          onOpenFilters={handleOpenFilters}
        />
      )}

      {/* Content Area */}
      <View style={styles.content}>
        {selectedTab === 'services' ? (
          <CategoryServicesList
            categoryId={id || ''}
            services={category?.services || []}
            isLoading={isCategoryLoading}
          />
        ) : (
          <CategoryWorkersList
            categoryId={id || ''}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            maxRate={filters.maxRate}
            minRating={filters.minRating}
            available={filters.available}
          />
        )}
      </View>

      {/* Filters Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        contentPadding={false}
      >
        <FilterSheetContent
          filters={filters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          resultCount={null}
          showCategories={false}
          showMaxRate={true}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgApp,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bgApp,
  },
  content: {
    flex: 1,
  },
});
