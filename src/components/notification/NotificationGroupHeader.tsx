import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface NotificationGroupHeaderProps {
  title: string;
  count?: number;
}

/**
 * NotificationGroupHeader Component
 *
 * Sticky section header for FlashList.
 * Uses Poppins-SemiBold typography with opaque background to prevent underlying row bleeding.
 */
export const NotificationGroupHeader: React.FC<NotificationGroupHeaderProps> = React.memo(
  function NotificationGroupHeader({ title, count }) {
    return (
      <View style={styles.container} accessibilityRole="header">
        <Text style={styles.title}>{title}</Text>
        {count !== undefined && count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#475569',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#64748B',
  },
});
