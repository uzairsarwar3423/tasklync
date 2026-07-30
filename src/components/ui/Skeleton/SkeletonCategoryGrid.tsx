import { View, StyleSheet } from 'react-native';
import { SkeletonCategoryCard } from './SkeletonCategoryCard';
import { layout } from '../../../design/spacing';

export const SkeletonCategoryGrid = () => {
  return (
    <View style={styles.grid}>
      {[...Array(6)].map((_, index) => (
        <SkeletonCategoryCard key={`skeleton-cat-${index}`} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: 12,
  },
});
