import { StyleSheet, ScrollView } from 'react-native';
import { SkeletonCategoryCard } from './SkeletonCategoryCard';

export const SkeletonCategoryGrid = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={styles.container}
    >
      {[...Array(6)].map((_, index) => (
        <SkeletonCategoryCard key={`skeleton-cat-${index}`} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 34,
    gap: 22,
    paddingVertical: 4,
  },
});
