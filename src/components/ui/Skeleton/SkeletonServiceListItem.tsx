import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonServiceListItem = () => {
  const { width: W } = useWindowDimensions();
  // Cards shown 2 per row with 16px side padding and 12px gap
  const CARD_W = Math.floor((W - 32 - 12) / 2);

  return (
    <View style={[styles.container, { width: CARD_W }]}>
      <View style={styles.mediaArea}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </View>

      <View style={styles.detailsArea}>
        <View style={styles.content}>
          <Skeleton width="90%" height={14} style={styles.name} />
          <Skeleton width="60%" height={14} style={styles.name2} />
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceTextContainer}>
            <Skeleton width={32} height={10} style={{ marginBottom: 4 }} />
            <Skeleton width={56} height={14} />
          </View>
          <Skeleton width={80} height={32} borderRadius={100} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    marginBottom: 12,
    ...shadows.sm,
    flexDirection: 'column',
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
  },
  mediaArea: {
    width: '100%',
    height: 140,
    overflow: 'hidden',
  },
  detailsArea: {
    flex: 1,
    padding: 12,
    flexDirection: 'column',
  },
  content: {
    marginBottom: 8,
  },
  name: {
    marginBottom: 4,
  },
  name2: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});
