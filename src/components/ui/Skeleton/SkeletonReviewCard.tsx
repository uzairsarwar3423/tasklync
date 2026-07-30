import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { radius } from '@design/radius';
import { shadows } from '@design/shadows';

export const SkeletonReviewCard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.metaRow}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.metaText}>
          <Skeleton width={120} height={13} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={11} />
        </View>
      </View>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} width={16} height={16} borderRadius={8} style={{ marginRight: 2 }} />
        ))}
      </View>

      <View style={styles.commentBlock}>
        <Skeleton width={300} height={13} style={{ marginBottom: 6 }} />
        <Skeleton width={280} height={13} style={{ marginBottom: 6 }} />
        <Skeleton width={200} height={13} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    ...shadows.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentBlock: {
    marginTop: 4,
  },
});
