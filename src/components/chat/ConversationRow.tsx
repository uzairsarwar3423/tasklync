import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BadgeCheck, CheckCheck } from 'lucide-react-native';
import { ConversationItem } from '../../types/chat.types';
import { formatRelativeTime } from '../../utils/groupByDate';
import { colors, bookingStatusColors } from '../../design/colors';
import { fontFamily } from '../../design/typography';

interface ConversationRowProps {
  item: ConversationItem;
  onPress: (item: ConversationItem) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ConversationRow = React.memo(function ConversationRow({
  item,
  onPress,
}: ConversationRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.985, { damping: 18, stiffness: 320 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  };

  const handlePress = () => {
    onPress(item);
  };

  const trimmedName = item.workerName ? item.workerName.trim() : 'Professional';
  const initial = trimmedName.charAt(0).toUpperCase();
  const timeLabel = formatRelativeTime(item.lastMessageAt);
  const isUnread = item.unreadCount > 0;
  const isOutgoing =
    item.lastMessageSenderType === 'user' || item.lastMessageSenderType === 'customer';

  // Status badge styling
  const rawStatus = (item.bookingStatus || '').toUpperCase();
  const statusConfig =
    (bookingStatusColors as Record<string, any>)[rawStatus] || {
      bg: '#F1F5F9',
      text: '#475569',
      border: '#E2E8F0',
    };

  const formattedStatus = rawStatus && rawStatus !== 'AVAILABLE'
    ? rawStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle, isUnread && styles.unreadContainer]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${trimmedName}, ${isUnread ? `${item.unreadCount} unread messages` : ''}`}
    >
      {/* Avatar with Strict Online Presence Tick */}
      <View style={styles.avatarContainer}>
        {item.workerAvatarUrl ? (
          <Image
            source={{ uri: item.workerAvatarUrl }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}

        {/* Online Indicator Tick/Dot: ONLY rendered when worker is strictly online */}
        {item.isOnline && (
          <View style={styles.onlineBadge} pointerEvents="none">
            <View style={styles.onlineBadgeInner} />
          </View>
        )}
      </View>

      {/* Conversation Details */}
      <View style={styles.content}>
        {/* Row 1: Name + Verified Badge + Timestamp */}
        <View style={styles.topRow}>
          <View style={styles.nameBlock}>
            <Text
              style={[styles.name, isUnread && styles.nameUnread]}
              numberOfLines={1}
            >
              {trimmedName}
            </Text>
            <BadgeCheck size={15} color={colors.primaryDark} style={styles.verifiedIcon} />
          </View>

          <Text style={[styles.time, isUnread && styles.timeUnread]}>
            {timeLabel}
          </Text>
        </View>

        {/* Row 2: Category Pill + Booking Status (Airbnb/TaskRabbit metadata) */}
        <View style={styles.metaRow}>
          {item.categoryName ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.categoryName}
              </Text>
            </View>
          ) : null}

          {formattedStatus ? (
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusText, { color: statusConfig.text }]}>
                {formattedStatus}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Row 3: Message preview & Unread badge counter */}
        <View style={styles.bottomRow}>
          <View style={styles.messageWrapper}>
            {isOutgoing && (
              <CheckCheck size={14} color={colors.primaryDark} style={styles.outCheck} />
            )}
            <Text
              style={[styles.messagePreview, isUnread && styles.messagePreviewUnread]}
              numberOfLines={1}
            >
              {isOutgoing ? <Text style={styles.youPrefix}>You: </Text> : null}
              {item.lastMessage}
            </Text>
          </View>

          {isUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unreadCount > 99 ? '99+' : `${item.unreadCount}`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  unreadContainer: {
    backgroundColor: '#FAFCFF',
    borderColor: '#BFDBFE',
    borderLeftWidth: 3.5,
    borderLeftColor: colors.primaryDark,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 2.5,
      },
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#F8FAFC',
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
  },
  avatarInitial: {
    fontFamily: fontFamily.poppins.bold,
    fontSize: 21,
    color: colors.primaryDark,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.35,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  onlineBadgeInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981', // Vivid emerald green
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  name: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 15.5,
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  nameUnread: {
    fontFamily: fontFamily.jakarta.bold,
    color: '#0F172A',
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  time: {
    fontFamily: fontFamily.inter.medium,
    fontSize: 11.5,
    color: '#94A3B8',
  },
  timeUnread: {
    fontFamily: fontFamily.inter.bold,
    color: colors.primaryDark,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 6,
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 11,
    color: '#475569',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 10,
    letterSpacing: 0.1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  outCheck: {
    marginRight: 4,
  },
  messagePreview: {
    flex: 1,
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  messagePreviewUnread: {
    fontFamily: fontFamily.jakarta.bold,
    color: '#0F172A',
  },
  youPrefix: {
    fontFamily: fontFamily.jakarta.medium,
    color: '#94A3B8',
  },
  badge: {
    backgroundColor: '#EF4444', // Premium notification badge red
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 10.5,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
