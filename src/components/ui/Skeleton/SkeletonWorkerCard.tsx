import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';
import { layout } from '../../../design/spacing';

export const SkeletonWorkerCard = () => {
  return (
    <View style={styles.container}>
      <Skeleton width={56} height={56} borderRadius={28} />
      
      <View style={styles.content}>
        <Skeleton width={120} height={15} style={styles.name} />
        <Skeleton width={80} height={13} style={styles.sub} />
        <Skeleton width={100} height={13} />
      </View>
      
      <View style={styles.rightContent}>
        <Skeleton width={60} height={14} style={styles.price} />
        <Skeleton width={50} height={11} />
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
