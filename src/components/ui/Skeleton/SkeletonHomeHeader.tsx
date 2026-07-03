import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors } from '../../../design/colors';
import { radius } from '../../../design/radius';

export const SkeletonHomeHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSide}>
        <Skeleton width={140} height={28} borderRadius={radius.pill} />
        <View style={styles.greetingContainer}>
          <Skeleton width={180} height={18} borderRadius={4} />
        </View>
      </View>
      <View style={styles.rightSide}>
        <Skeleton width={40} height={40} borderRadius={20} style={styles.bell} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bgCard,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSide: {
    flex: 1,
  },
  greetingContainer: {
    marginTop: 8,
  },
  rightSide: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 50,
  },
  bell: {
    backgroundColor: colors.border,
  },
});
