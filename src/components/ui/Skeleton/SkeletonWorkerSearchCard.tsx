import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonWorkerSearchCard = () => {
  const { width: W } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <Skeleton width={52} height={52} borderRadius={26} />
      </View>

      <View style={styles.centerColumn}>
        <Skeleton width={Math.floor(W * 0.38)} height={14} borderRadius={4} />
        <Skeleton width={Math.floor(W * 0.28)} height={11} borderRadius={4} />
        <Skeleton width={Math.floor(W * 0.48)} height={11} borderRadius={4} />
      </View>

      <View style={styles.rightColumn}>
        <Skeleton width={Math.floor(W * 0.18)} height={14} borderRadius={4} />
        <Skeleton width={Math.floor(W * 0.2)} height={11} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    ...shadows.sm,
  },
  leftColumn: {},
  centerColumn: {
    flex: 1,
    marginLeft: 12,
    gap: 6,
    justifyContent: 'center',
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 6,
  },
});
