import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { SkeletonCategoryGrid } from '../ui/Skeleton';
import { ServiceCategoryCard } from '../service/ServiceCategoryCard';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category.types';

export const CategoryGrid = () => {
  const queryClient = useQueryClient();
  const { categories, isLoading, error } = useCategories();

  const visibleCategories = categories?.slice(0, 6) || [];

  useEffect(() => {
    // Prefetch individual category queries on mount
    visibleCategories.forEach((category) => {
      queryClient.prefetchQuery({
        queryKey: ['category', category.id],
      });
    });
  }, [visibleCategories, queryClient]);

  const renderItem = useCallback(
    ({ item, index }: { item: Category; index: number }) => (
      <ServiceCategoryCard category={item} index={index} />
    ),
    []
  );

  const renderSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), []);

  const keyExtractor = useCallback((item: Category) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SkeletonCategoryGrid />
      </View>
    );
  }

  if (error || visibleCategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleCategories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={true}
        decelerationRate="normal"
        directionalLockEnabled={true}
        alwaysBounceVertical={false}
        nestedScrollEnabled={true}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 4,
  },
  listContent: {
    paddingLeft: 34,
    paddingRight: 38, // Generous trailing padding so the last item can scroll fully into view
    alignItems: 'flex-start',
  },
  separator: {
    width: 22, // Category gap: ~18–26px
  },
});
