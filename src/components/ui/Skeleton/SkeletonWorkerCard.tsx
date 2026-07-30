import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';
import { layout } from '../../../design/spacing';

export const SkeletonWorkerCard = () => {
  const { width: W } = useWindowDimensions();
  const nameW = Math.floor(W * 0.35);
  const subW = Math.floor(W * 0.22);
  const descW = Math.floor(W * 0.28);
  const priceW = Math.floor(W * 0.16);
  const ratingW = Math.floor(W * 0.14);

  return (
    <View style={styles.container}>
      <Skeleton width={56} height={56} borderRadius={28} />

      <View style={styles.content}>
        <Skeleton width={nameW} height={15} style={styles.name} />
        <Skeleton width={subW} height={13} style={styles.sub} />
        <Skeleton width={descW} height={13} />
      </View>

      <View style={styles.rightContent}>
        <Skeleton width={priceW} height={14} style={styles.price} />
        <Skeleton width={ratingW} height={11} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: layout.cardGap,
    ...shadows.sm,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    marginBottom: 4,
  },
  sub: {
    marginBottom: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  price: {
    marginBottom: 4,
  },
});
