import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { NotificationItem as NotificationItemType } from '../../types/notification.types';
import { NotificationIcon } from './NotificationIcon';
import { formatRelativeTime } from '../../utils/groupByDate';

export interface NotificationItemProps {
  item: NotificationItemType;
  onPress: (item: NotificationItemType) => void;
}

/**
 * NotificationItem Component
 *
 * Presentational Row Component adhering to Day 32 UX and typography specs:
 * - Row height >= 72px (Fitts's Law generous touch target)
 * - Microinteraction through typography: Poppins-SemiBold when unread, PlusJakartaSans-Medium when read
 * - 2-line clamp with ellipsis for predictable FlashList item recycling height
 * - Precise Inter typography for relative timestamps ("2m ago", "Yesterday")
 * - Left accent border & glowing indicator dot for unread status
 */
export const NotificationItem: React.FC<NotificationItemProps> = React.memo(
  function NotificationItem({ item, onPress }) {
    const handlePress = useCallback(() => {
      onPress(item);
    }, [item, onPress]);

    const isUnread = !item.is_read;
    const timeDisplay = formatRelativeTime(item.created_at);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.container,
          isUnread ? styles.containerUnread : styles.containerRead,
          pressed && styles.containerPressed,
        ]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.body}, ${timeDisplay}, ${
          isUnread ? 'unread' : 'read'
        }`}
        accessibilityState={{ selected: isUnread }}
      >
        {/* Category Icon Atom */}
        <NotificationIcon
          category={item.category}
          templateKey={item.template_key}
          size={18}
          containerSize={42}
          style={styles.iconWrapper}
        />

        {/* Content Box */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.title,
                isUnread ? styles.titleUnread : styles.titleRead,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.timeText}>{timeDisplay}</Text>
          </View>

          <Text style={styles.body} numberOfLines={2} ellipsizeMode="tail">
            {item.body}
          </Text>
        </View>

        {/* Right Status (Unread Dot or Chevron) */}
        {isUnread ? (
          <View style={styles.unreadDotContainer}>
            <View style={styles.unreadDot} />
          </View>
        ) : (
          <View style={styles.chevronContainer}>
            <ChevronRight size={16} color="#CBD5E1" />
          </View>
        )}
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  containerRead: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  containerUnread: {
    borderColor: '#BBF7D0',
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
    backgroundColor: '#FFFFFF',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  containerPressed: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.995 }],
  },
  iconWrapper: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  titleUnread: {
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  titleRead: {
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#334155',
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  body: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  unreadDotContainer: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  chevronContainer: {
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
  },
});
