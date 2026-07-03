import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Text } from '../ui/Text/Text';
import { SkeletonCategoryGrid } from '../ui/Skeleton';
import { ServiceCategoryCard } from '../service/ServiceCategoryCard';
import { useCategories } from '../../hooks/useCategories';
import { colors } from '../../design/colors';
import { layout } from '../../design/spacing';
import { fontFamily } from '../../design/typography';

export const CategoryGrid = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { categories, isLoading, error, refetch } = useCategories();

  const visibleCategories = categories?.slice(0, 6) || [];

  useEffect(() => {
    // Prefetch individual category queries on mount
    visibleCategories.forEach((category) => {
      queryClient.prefetchQuery({
        queryKey: ['category', category.id],
      });
    });
  }, [visibleCategories, queryClient]);

  const handleSeeAll = () => {
    router.push('/explore' as any);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SectionHeader onSeeAll={handleSeeAll} />
        <SkeletonCategoryGrid />
      </View>
    );
  }

  if (error || visibleCategories.length === 0) {
    // Show error state or empty state as skeleton to prevent layout jump
    return (
      <View style={styles.container}>
        <SectionHeader onSeeAll={handleSeeAll} />
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Services unavailable. </Text>
            <Pressable onPress={() => refetch()} hitSlop={8}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <SkeletonCategoryGrid />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader onSeeAll={handleSeeAll} />
      <View style={styles.grid}>
        {visibleCategories.map((category, index) => (
          <ServiceCategoryCard
            key={category.id}
            category={category}
            index={index}
          />
        ))}
      </View>
    </View>
  );
};

const SectionHeader = ({ onSeeAll }: { onSeeAll: () => void }) => (
  <View style={styles.headerRow}>
    <Text variant="h4" style={styles.title}>Services</Text>
    <Pressable onPress={onSeeAll} hitSlop={8}>
      <Text style={styles.seeAll}>See all →</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingH,
  },
  title: {
    fontFamily: fontFamily.poppins.semiBold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 13,
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: 12,
  },
  errorText: {
    color: colors.textMuted,
  },
  retryText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
