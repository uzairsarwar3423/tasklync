import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { radius } from '../../../design/radius';

export const SkeletonWorkerBio = () => {
  return (
    <View style={styles.container}>
      <Skeleton width={80} height={20} borderRadius={radius.sm} style={styles.header} />
      <Skeleton width="100%" height={14} borderRadius={radius.sm} style={styles.line} />
      <Skeleton width="95%" height={14} borderRadius={radius.sm} style={styles.line} />
      <Skeleton width="98%" height={14} borderRadius={radius.sm} style={styles.line} />
      <Skeleton width="40%" height={14} borderRadius={radius.sm} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    marginBottom: 12,
  },
  line: {
    marginBottom: 8,
  },
});
