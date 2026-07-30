import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { FilterState } from '../../types/search.types';
import { RadioGroup } from '../ui/Radio';
import { ChipGroup } from '../ui/Chip';
import { StarRatingFilter } from '../ui/Rating/StarRatingFilter';
import { Button } from '../ui/Button/Button';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { RangeSlider } from '../ui/Slider/RangeSlider';

interface FilterSheetContentProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  resultCount: number | null;
  showCategories?: boolean;
  showMaxRate?: boolean;
}

const getSafeFilters = (f?: FilterState): FilterState => ({
  categories: f?.categories ?? [],
  minRating: f?.minRating ?? 0,
  minRate: f?.minRate ?? 0,
  maxRate: f?.maxRate ?? 0,
  sortBy: f?.sortBy ?? 'distance',
  available: f?.available ?? 'any',
});

export const FilterSheetContent: React.FC<FilterSheetContentProps> = ({
  filters,
  onApply,
  onReset,
  resultCount,
  showCategories = true,
  showMaxRate = true,
}) => {
  // We use local state for editing, only call onApply when done
  const [localFilters, setLocalFilters] = React.useState<FilterState>(() => getSafeFilters(filters));

  // Sync if external filters change while open
  React.useEffect(() => {
    setLocalFilters(getSafeFilters(filters));
  }, [filters]);

  const handleSortChange = (value: string) => {
    setLocalFilters((prev) => ({ ...getSafeFilters(prev), sortBy: value as FilterState['sortBy'] }));
  };

  const handleCategorySelect = (value: string) => {
    setLocalFilters((prev) => {
      const current = getSafeFilters(prev);
      const isSelected = current.categories.includes(value);
      const updatedCats = isSelected
        ? current.categories.filter((c) => c !== value)
        : [...current.categories, value];
      return { ...current, categories: updatedCats };
    });
  };

  const handleRatingChange = (value: number) => {
    setLocalFilters((prev) => ({ ...getSafeFilters(prev), minRating: value }));
  };

  const handleAvailabilitySelect = (value: string) => {
    setLocalFilters((prev) => ({ ...getSafeFilters(prev), available: value as FilterState['available'] }));
  };

  // Dummy categories mapping to actual names for mock data
  const categoryOptions = [
    { label: 'Electrician', value: 'Electrician' },
    { label: 'Plumber', value: 'Plumber' },
    { label: 'AC Repair', value: 'AC Repair' },
    { label: 'Cleaning', value: 'Cleaning' },
    { label: 'Carpenter', value: 'Carpenter' },
    { label: 'Painter', value: 'Painter' },
  ];

  const getApplyLabel = () => {
    if (resultCount === null) return 'Apply Filters';
    if (resultCount === 0) return 'No workers match these filters';
    if (resultCount === 1) return 'Apply (1 worker)';
    return `Apply (${resultCount} workers)`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filters</Text>
        <Pressable onPress={onReset} hitSlop={12}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Sort by</Text>
          <RadioGroup
            options={[
              { label: 'Nearest first', value: 'distance' },
              { label: 'Highest rated', value: 'rating' },
              { label: 'Lowest price', value: 'price_low' },
              { label: 'Highest price', value: 'price_high' },
            ]}
            selected={localFilters.sortBy}
            onChange={handleSortChange}
          />
        </View>

        {showCategories && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Category</Text>
            <ChipGroup
              options={categoryOptions}
              selected={localFilters.categories}
              onSelect={handleCategorySelect}
              multiSelect
              scrollable
              chipSize="sm"
              paddingH={0} // container already has padding
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Minimum rating</Text>
          <StarRatingFilter
            value={localFilters.minRating}
            onChange={handleRatingChange}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Availability</Text>
          <ChipGroup
            options={[
              { label: 'Any time', value: 'any' },
              { label: 'Available now', value: 'now' },
              { label: 'Today', value: 'today' },
            ]}
            selected={localFilters.available}
            onSelect={handleAvailabilitySelect}
            multiSelect={false}
            scrollable={false}
          />
        </View>

        {showMaxRate && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Price Range</Text>
            <RangeSlider
              min={100}
              max={10000}
              step={100}
              value={[localFilters.minRate || 100, localFilters.maxRate || 10000]}
              onChange={(val) => {
                setLocalFilters((prev) => ({ ...prev, minRate: val[0], maxRate: val[1] }));
              }}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={getApplyLabel()}
          onPress={() => onApply(localFilters)}
          variant={resultCount === 0 ? 'secondary' : 'primary'} // Might want disabled or danger variant later
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    backgroundColor: colors.bgCard,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.poppins.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  resetText: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 24,
    paddingBottom: 20, // Reduced since footer is no longer absolute
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8, // BottomSheet already adds safe area padding
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
