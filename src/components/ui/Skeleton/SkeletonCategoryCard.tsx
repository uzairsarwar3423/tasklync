import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonCategoryCard = () => {
  return (
    <View style={styles.container}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.labelContainer}>
        <Skeleton width={60} height={12} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 106,
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
