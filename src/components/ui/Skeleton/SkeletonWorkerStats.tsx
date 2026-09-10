import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { radius } from '../../../design/radius';

export const SkeletonWorkerStats = () => {
  return (
    <View style={styles.container}>
      <View style={styles.cell}>
        <Skeleton width={18} height={18} borderRadius={9} style={styles.shimmer} />
        <Skeleton width="65%" height={14} borderRadius={radius.sm} style={styles.shimmer} />
        <Skeleton width="50%" height={10} borderRadius={radius.sm} />
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Skeleton width={18} height={18} borderRadius={9} style={styles.shimmer} />
        <Skeleton width="65%" height={14} borderRadius={radius.sm} style={styles.shimmer} />
        <Skeleton width="50%" height={10} borderRadius={radius.sm} />
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Skeleton width={18} height={18} borderRadius={9} style={styles.shimmer} />
        <Skeleton width="65%" height={14} borderRadius={radius.sm} style={styles.shimmer} />
        <Skeleton width="50%" height={10} borderRadius={radius.sm} />
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Skeleton width={18} height={18} borderRadius={9} style={styles.shimmer} />
        <Skeleton width="65%" height={14} borderRadius={radius.sm} style={styles.shimmer} />
        <Skeleton width="50%" height={10} borderRadius={radius.sm} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  shimmer: {
    marginBottom: 4,
  },
});
