import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../ui/Skeleton/Skeleton';

export const SkeletonConversationRow: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Avatar skeleton */}
      <Skeleton width={52} height={52} borderRadius={26} style={styles.avatar} />

      {/* Content lines skeleton */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Skeleton width="45%" height={16} borderRadius={4} />
          <Skeleton width={45} height={12} borderRadius={4} />
        </View>

        <View style={styles.metaRow}>
          <Skeleton width="28%" height={12} borderRadius={4} />
          <Skeleton width={60} height={16} borderRadius={6} />
        </View>

        <View style={styles.bottomRow}>
          <Skeleton width="80%" height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatar: {
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
