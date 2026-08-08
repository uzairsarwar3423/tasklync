import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonWorkerServiceRow: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Skeleton width="80%" height={16} borderRadius={radius.sm} style={styles.title} />
        <Skeleton width="45%" height={12} borderRadius={radius.sm} />
      </View>
      <View style={styles.right}>
        <Skeleton width={56} height={14} borderRadius={radius.sm} />
        <Skeleton width={80} height={32} borderRadius={100} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.bgCard || '#FFFFFF',
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border || '#F1F5F9',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.xs,
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    marginBottom: 8,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
});

