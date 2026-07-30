import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { radius } from '../../../design/radius';

export const SkeletonWorkerProfileHero = () => {
  return (
    <View style={styles.container}>
      <Skeleton width="100%" height="100%" borderRadius={0} />
      
      {/* Absolute Overlay simulating Avatar & text */}
      <View style={styles.contentOverlay}>
        <Skeleton width={80} height={80} borderRadius={40} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Skeleton width="60%" height={20} borderRadius={radius.sm} style={styles.line} />
          <Skeleton width="40%" height={14} borderRadius={radius.sm} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 4,
  },
  line: {
    marginBottom: 8,
  },
});
