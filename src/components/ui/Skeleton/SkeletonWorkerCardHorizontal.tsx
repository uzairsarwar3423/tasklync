import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';
import { shadows } from '../../../design/shadows';

export const SkeletonWorkerCardHorizontal = () => {
  return (
    <View style={styles.container}>
      <Skeleton width={160} height={80} borderRadius={0} />
      
      <View style={styles.content}>
        <Skeleton width={100} height={13} style={styles.name} />
        <Skeleton width={70} height={11} style={styles.category} />
        
        <View style={styles.ratingRow}>
          <Skeleton width={50} height={12} />
          <Skeleton width={50} height={12} />
        </View>
        
        <Skeleton width={80} height={11} style={styles.status} />
        <Skeleton width={60} height={13} style={styles.price} />
      </View>
      
      <View style={styles.buttonArea}>
        <Skeleton width={140} height={30} borderRadius={15} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 240,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    flex: 1,
  },
  name: {
    marginBottom: 4,
  },
  category: {
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  status: {
    marginBottom: 4,
  },
  price: {
    marginTop: 'auto',
    marginBottom: 0,
  },
  buttonArea: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
});
