import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Skeleton } from './Skeleton';
import { radius } from '@design/radius';

export const SkeletonPortfolioGrid = () => {
  const { width } = useWindowDimensions();
  const padding = 32; // 16px horizontal padding
  const gap = 4;
  const numColumns = 3;
  const totalGapWidth = gap * (numColumns - 1);
  const cellSize = Math.floor((width - padding - totalGapWidth) / numColumns);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Skeleton width={80} height={20} />
        <Skeleton width={120} height={16} />
      </View>

      {/* Grid */}
      <View style={[styles.grid, { gap }]}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            width={cellSize}
            height={cellSize}
            borderRadius={radius.sm}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
});
