import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';
import { layout } from '../../../design/spacing';

export const SkeletonCategoryCard = () => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const numColumns = SCREEN_WIDTH > 700 ? 6 : 3;
  const CARD_WIDTH = Math.floor((SCREEN_WIDTH - (layout.screenPaddingH * 2) - (layout.categoryGap * (numColumns - 1))) / numColumns);

  return (
    <View style={[styles.container, { width: CARD_WIDTH }]}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.labelContainer}>
        <Skeleton width={60} height={12} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  labelContainer: {
    marginTop: 8,
  },
});
