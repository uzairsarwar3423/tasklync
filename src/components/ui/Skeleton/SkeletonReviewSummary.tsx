import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';

export const SkeletonReviewSummary = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Skeleton width={80} height={20} />
        <Skeleton width={100} height={16} />
      </View>

      {/* Overall Block */}
      <View style={styles.overallBlock}>
        <Skeleton width={60} height={36} style={{ marginBottom: 4 }} />
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width={20} height={20} borderRadius={10} style={{ marginRight: i === 5 ? 0 : 4 }} />
          ))}
        </View>
        <Skeleton width={100} height={14} style={{ marginTop: 4 }} />
      </View>

      <View style={styles.divider} />

      {/* Breakdown */}
      <View style={styles.breakdownBlock}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.barRow}>
            <Skeleton width={80} height={13} style={{ marginRight: 30 }} />
            <Skeleton height={6} borderRadius={3} style={{ flex: 1 }} />
            <Skeleton width={30} height={13} style={{ marginLeft: 8 }} />
          </View>
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
    marginBottom: 16,
  },
  overallBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  breakdownBlock: {
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
