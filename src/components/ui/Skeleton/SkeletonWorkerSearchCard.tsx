import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonWorkerSearchCard: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <Skeleton width={52} height={52} borderRadius={26} />
      </View>

      <View style={styles.centerColumn}>
        <Skeleton width={140} height={16} borderRadius={4} />

        <View style={styles.chipsRow}>
          <Skeleton width={52} height={18} borderRadius={100} />
          <Skeleton width={64} height={18} borderRadius={100} />
        </View>

        <Skeleton width={130} height={12} borderRadius={4} style={{ marginTop: 2 }} />
      </View>

      <View style={styles.rightColumn}>
        <Skeleton width={68} height={16} borderRadius={4} />
        <Skeleton width={76} height={22} borderRadius={100} />
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
    marginBottom: 10,
    ...shadows.sm,
  },
  leftColumn: {
    position: 'relative',
  },
  centerColumn: {
    flex: 1,
    marginLeft: 12,
    gap: 3,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginVertical: 2,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    paddingTop: 2,
  },
});

