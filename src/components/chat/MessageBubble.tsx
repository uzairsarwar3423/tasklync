import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MessageBubbleItem } from '../../types/chat.types';
import { ReadReceipt } from './ReadReceipt';
import { formatPKTTime } from '../../utils/timezone';

interface MessageBubbleProps {
  item: MessageBubbleItem;
  workerAvatarUrl?: string | undefined;
  onRetry?: (tempId: string) => void;
}

export const MessageBubble = React.memo(function MessageBubble({
  item,
  workerAvatarUrl,
  onRetry,
}: MessageBubbleProps) {
  const { message, isFirstInGroup, isLastInGroup, showAvatar, isOutgoing, readReceiptStatus } = item;

  // Entrance animation: translateY 12 -> 0, opacity 0 -> 1 (200ms spring-gentle)
  const translateY = useSharedValue(12);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 220, mass: 0.8 });
    opacity.value = withTiming(1, { duration: 180 });
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const timeString = formatPKTTime(message.created_at);
  const isFailed = readReceiptStatus === 'failed';

  const bubbleCustomStyle: ViewStyle[] = [
    styles.bubble,
    isOutgoing ? styles.bubbleOutgoing : styles.bubbleIncoming,
  ];

  if (!isFirstInGroup) {
    bubbleCustomStyle.push(isOutgoing ? styles.bubbleTightTopRight : styles.bubbleTightTopLeft);
  }
  if (!isLastInGroup) {
    bubbleCustomStyle.push(isOutgoing ? styles.bubbleTightBottomRight : styles.bubbleTightBottomLeft);
  }

  return (
    <Animated.View
      style={[
        styles.row,
        isOutgoing ? styles.rowOutgoing : styles.rowIncoming,
        isFirstInGroup ? styles.rowFirstInGroup : undefined,
        animatedStyle,
      ]}
    >
      {/* Incoming Avatar */}
      {!isOutgoing && (
        <View style={styles.avatarColumn}>
          {showAvatar ? (
            workerAvatarUrl ? (
              <Image source={{ uri: workerAvatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>W</Text>
              </View>
            )
          ) : (
            <View style={styles.avatarSpacer} />
          )}
        </View>
      )}

      {/* Bubble + Metadata Container */}
      <View style={[styles.bubbleContainer, isOutgoing ? styles.alignRight : styles.alignLeft]}>
        {/* Bubble */}
        <View style={bubbleCustomStyle}>
          {message.type === 'image' && message.media_url ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: message.media_url }} style={styles.messageImage} resizeMode="cover" />
              {message.content ? (
                <Text style={[styles.text, isOutgoing ? styles.textOutgoing : styles.textIncoming, styles.textWithImage]}>
                  {message.content}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.text, isOutgoing ? styles.textOutgoing : styles.textIncoming]}>
              {message.content}
            </Text>
          )}

          {/* Time & Read Receipt Inside/Beside Bubble */}
          <View style={styles.metaRow}>
            <Text style={[styles.timeText, isOutgoing ? styles.timeOutgoing : styles.timeIncoming]}>
              {timeString}
            </Text>
            {isOutgoing && <ReadReceipt status={readReceiptStatus} />}
          </View>
        </View>

        {/* Failed Retry Affordance */}
        {isFailed && (
          <Pressable
            style={styles.retryButton}
            onPress={() => onRetry && (message.temp_id || message.id) && onRetry(message.temp_id || message.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.retryText}>Failed to send. Tap to retry.</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 2,
  },
  rowFirstInGroup: {
    marginTop: 8,
  },
  rowIncoming: {
    justifyContent: 'flex-start',
  },
  rowOutgoing: {
    justifyContent: 'flex-end',
  },
  avatarColumn: {
    width: 32,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#6B7280',
  },
  avatarSpacer: {
    width: 28,
    height: 28,
  },
  bubbleContainer: {
    maxWidth: '78%',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 7,
    borderRadius: 18,
  },
  bubbleIncoming: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleOutgoing: {
    backgroundColor: '#16A34A',
    borderBottomRightRadius: 4,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleTightTopLeft: {
    borderTopLeftRadius: 6,
  },
  bubbleTightBottomLeft: {
    borderBottomLeftRadius: 6,
  },
  bubbleTightTopRight: {
    borderTopRightRadius: 6,
  },
  bubbleTightBottomRight: {
    borderBottomRightRadius: 6,
  },
  text: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    lineHeight: 21,
  },
  textWithImage: {
    marginTop: 6,
  },
  textIncoming: {
    color: '#111827',
  },
  textOutgoing: {
    color: '#FFFFFF',
  },
  imageWrapper: {
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
  timeIncoming: {
    color: '#9CA3AF',
  },
  timeOutgoing: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  retryButton: {
    marginTop: 4,
  },
  retryText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#EF4444',
  },
});
