import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { radius } from '../../../design/radius';
import { colors } from '../../../design/colors';

export const SkeletonWorkerStats = () => {
  return (
    <View style={styles.container}>
      <View style={styles.cell}>
        <Skeleton width="40%" height={24} borderRadius={radius.sm} style={styles.shimmer} />
        <Skeleton width="60%" height={12} borderRadius={radius.sm} />
      </View>
      
      <View style={[styles.cell, styles.middleBorder]}>
        <Skeleton width="40%" height={24} borderRadius={radius.sm} style={styles.shimmer} />
        <Skeleton width="60%" height={12} borderRadius={radius.sm} />
      </View>
      <View style={styles.cell}>
        <Skeleton width="40%" height={24} borderRadius={radius.sm} style={styles.shimmer} />
        <Skeleton width="60%" height={12} borderRadius={radius.sm} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bgSection || '#F9FAFB',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border || '#E5E7EB',
    width: '100%',
    height: 72,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  middleBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border || '#E5E7EB',
  },
  shimmer: {
    marginBottom: 6,
  },
});
