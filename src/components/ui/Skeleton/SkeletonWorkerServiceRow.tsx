import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { radius } from '../../../design/radius';

export const SkeletonWorkerServiceRow = () => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Skeleton width="70%" height={16} borderRadius={radius.sm} style={styles.title} />
        <Skeleton width="40%" height={12} borderRadius={radius.sm} />
      </View>
      <View style={styles.right}>
        <Skeleton width={60} height={16} borderRadius={radius.sm} style={styles.price} />
        <Skeleton width={64} height={32} borderRadius={radius.pill} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    width: '100%',
    height: 64,
  },
  left: {
    flex: 1,
  },
  title: {
    marginBottom: 6,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    marginRight: 16,
  },
});
