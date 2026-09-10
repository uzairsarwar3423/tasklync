import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { radius } from '../../../design/radius';

export const SkeletonWorkerProfileHero = () => {
  return (
    <View style={styles.container}>
      {/* Top action buttons */}
      <View style={styles.navBar}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.navRight}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>
      </View>

      {/* Horizontal Worker row */}
      <View style={styles.workerRow}>
        <Skeleton width={86} height={86} borderRadius={43} />
        <View style={styles.textContainer}>
          <Skeleton width={90} height={18} borderRadius={10} style={styles.line} />
          <Skeleton width="70%" height={22} borderRadius={radius.sm} style={styles.line} />
          <Skeleton width="50%" height={14} borderRadius={radius.sm} style={styles.line} />
          <Skeleton width="35%" height={14} borderRadius={radius.sm} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navRight: {
    flexDirection: 'row',
    gap: 10,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  line: {
    marginBottom: 6,
  },
});
