import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonWorkerCardHorizontal = () => {
  const { width: windowWidth } = useWindowDimensions();

  // Reduced card width (~72% of screen width), matching WorkerCardHorizontal
  const CARD_WIDTH = windowWidth
    ? Math.min(Math.round(windowWidth * 0.72), 300)
    : 280;

  return (
    <View style={[styles.container, { width: CARD_WIDTH }]}>
      {/* Top Area: Avatar Left, Heart Placeholder Right */}
      <View style={styles.topArea}>
        <Skeleton width={58} height={58} borderRadius={29} />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>

      {/* Info Area: Name, Profession, Metadata Row */}
      <View style={styles.infoArea}>
        <Skeleton width={140} height={18} borderRadius={6} style={styles.nameSkeleton} />
        <Skeleton width={100} height={14} borderRadius={5} style={styles.professionSkeleton} />
        <Skeleton width={175} height={14} borderRadius={5} style={styles.metaSkeleton} />
      </View>

      {/* Bottom Action Row: Pricing Left, Mint Pill Button Right */}
      <View style={styles.bottomRow}>
        <Skeleton width={88} height={20} borderRadius={6} />
        <Skeleton width={96} height={36} borderRadius={radius.pill} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    height: 228,
    justifyContent: 'space-between',
    ...shadows.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  topArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  infoArea: {
    marginTop: 12,
    width: '100%',
  },
  nameSkeleton: {
    marginBottom: 6,
  },
  professionSkeleton: {
    marginBottom: 8,
  },
  metaSkeleton: {
    marginBottom: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 4,
  },
});
