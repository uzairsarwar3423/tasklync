import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';

export const SkeletonHomeHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSide}>
        <Skeleton width={20} height={20} borderRadius={10} />
        <Skeleton width={120} height={16} borderRadius={4} style={styles.locationTextSkeleton} />
      </View>
      <View style={styles.rightSide}>
        <Skeleton width={32} height={32} borderRadius={16} />
        <Skeleton width={36} height={36} borderRadius={18} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextSkeleton: {
    marginLeft: 6,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
