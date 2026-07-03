import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonServiceListItem = () => {
  return (
    <View style={styles.container}>
      <Skeleton width={48} height={48} borderRadius={radius.md} style={styles.icon} />
      
      <View style={styles.content}>
        <Skeleton width="90%" height={14} style={styles.name} />
        <Skeleton width="60%" height={14} style={styles.name2} />
        <Skeleton width="70%" height={12} style={styles.sub} />
        <Skeleton width="50%" height={12} style={styles.sub} />
      </View>
      
      <View style={styles.priceRow}>
        <Skeleton width="80%" height={14} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    height: 180, // Approximate height to match grid cards
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 16,
    ...shadows.sm,
    flexDirection: 'column',
  },
  icon: {
    marginBottom: 12,
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  name: {
    marginBottom: 4,
  },
  name2: {
    marginBottom: 12,
  },
  sub: {
    marginBottom: 4,
  },
  priceRow: {
    marginTop: 'auto',
  },
});
