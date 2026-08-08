import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonServiceListItem: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.mediaArea}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </View>

      <View style={styles.detailsArea}>
        <View style={styles.content}>
          <Skeleton width="90%" height={14} style={styles.nameLine1} />
          <Skeleton width="60%" height={14} style={styles.nameLine2} />
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceTextContainer}>
            <Skeleton width={32} height={10} style={{ marginBottom: 4 }} />
            <Skeleton width={60} height={16} />
          </View>
          <Skeleton width={80} height={32} borderRadius={100} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: radius.lg,
    marginBottom: 16,
    ...shadows.sm,
    flexDirection: 'column',
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
  },
  mediaArea: {
    width: '100%',
    height: 170,
    overflow: 'hidden',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  detailsArea: {
    flex: 1,
    padding: 12,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    minHeight: 40,
    marginBottom: 8,
  },
  nameLine1: {
    marginBottom: 6,
  },
  nameLine2: {
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    width: '100%',
  },
  priceTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});

