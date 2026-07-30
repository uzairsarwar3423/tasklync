import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';
import { layout } from '../../../design/spacing';

export const SkeletonWorkerCardHorizontal = () => {
  const { width: W } = useWindowDimensions();
  // Horizontal scroll cards: ~44% of screen on small, capped at 200
  const CARD_W = Math.min(Math.floor(W * 0.44), 200);

  return (
    <View style={[styles.container, { width: CARD_W }]}>
      <View style={styles.avatarSection}>
        <Skeleton width={72} height={72} borderRadius={36} />
      </View>

      <View style={styles.content}>
        <Skeleton width={Math.floor(CARD_W * 0.60)} height={14} style={styles.name} />
        <Skeleton width={Math.floor(CARD_W * 0.50)} height={12} style={styles.category} />

        <View style={styles.statsRow}>
          <Skeleton width={Math.floor(CARD_W * 0.65)} height={14} borderRadius={10} />
        </View>

        <View style={styles.priceRow}>
          <Skeleton width={Math.floor(CARD_W * 0.55)} height={14} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 216,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    ...shadows.sm,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    marginRight: layout.cardGap,
  },
  avatarSection: {
    marginBottom: 12,
    marginTop: 4,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    marginBottom: 4,
  },
  category: {
    marginBottom: 10,
  },
  statsRow: {
    marginBottom: 12,
  },
  priceRow: {
    marginTop: 4,
  },
});
