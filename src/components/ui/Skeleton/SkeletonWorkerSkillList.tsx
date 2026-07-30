import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { radius } from '../../../design/radius';

export const SkeletonWorkerSkillList = () => {
  return (
    <View style={styles.container}>
      <Skeleton width={120} height={20} borderRadius={radius.sm} style={styles.header} />
      <View style={styles.grid}>
        <Skeleton width={90} height={30} borderRadius={radius.pill} />
        <Skeleton width={110} height={30} borderRadius={radius.pill} />
        <Skeleton width={80} height={30} borderRadius={radius.pill} />
        <Skeleton width={100} height={30} borderRadius={radius.pill} />
        <Skeleton width={85} height={30} borderRadius={radius.pill} />
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
