import {
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonServiceCard: React.FC = () => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const cardWidth = Math.floor((SCREEN_WIDTH - 32 - 12) / 2);

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      {/* Top Icon Area */}
      <Skeleton
        width="100%"
        height={90}
        borderRadius={0}
        style={styles.iconAreaSkeleton}
      />

      {/* Content Area */}
      <View style={styles.contentArea}>
        {/* Name lines */}
        <View style={styles.nameContainer}>
          <Skeleton
            width="85%"
            height={13}
            borderRadius={4}
          />
          <Skeleton
            width="60%"
            height={13}
            borderRadius={4}
            style={styles.secondLine}
          />
        </View>

        {/* Category line */}
        <Skeleton
          width="40%"
          height={11}
          borderRadius={4}
        />

        {/* Footer row */}
        <View style={styles.footerRow}>
          <Skeleton
            width={65}
            height={14}
            borderRadius={4}
          />
          <Skeleton
            width={56}
            height={28}
            borderRadius={100}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    height: 200,
    ...shadows.sm,
    marginBottom: 12,
    overflow: 'hidden',
  },
  iconAreaSkeleton: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  contentArea: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  nameContainer: {
    gap: 4,
  },
  secondLine: {
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
});
