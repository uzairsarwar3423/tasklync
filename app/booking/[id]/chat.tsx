import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useChat } from '../../../src/hooks/useChat';
import { useTypingIndicator } from '../../../src/hooks/useTypingIndicator';
import { bookingApi } from '../../../src/services/api/booking.api';
import { BookingDetails } from '../../../src/types/booking.types';
import { MessageRenderItem } from '../../../src/types/chat.types';
import {
  ChatHeader,
  ChatInput,
  MessageBubble,
  MessageTimestamp,
  SystemMessage,
  TypingIndicator,
  ChatSkeleton,
} from '../../../src/components/chat';

export default function BookingChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = typeof id === 'string' ? id : '';

  const [booking, setBooking] = useState<BookingDetails | null>(null);

  const {
    renderItems,
    isLoading,
    isWorkerTyping,
    isRoomClosed,
    sendMessage,
    retrySendMessage,
    loadMore,
    markRead,
  } = useChat(bookingId);

  const { notifyTyping, stopTypingImmediately } = useTypingIndicator(bookingId);

  // Fetch booking details for header metadata (worker name, avatar, phone)
  useEffect(() => {
    if (!bookingId) return;
    bookingApi
      .getBookingDetails(bookingId)
      .then((b) => setBooking(b))
      .catch(() => {});
  }, [bookingId]);

  // Mark all messages as read when screen is focused
  useFocusEffect(
    useCallback(() => {
      markRead();
    }, [markRead])
  );

  const handleSend = useCallback(
    (text: string, type: 'text' | 'image' = 'text', mediaUrl?: string) => {
      sendMessage(text, type, mediaUrl);
    },
    [sendMessage]
  );

  const handleCallPress = useCallback(() => {
    const phone = '+923001234567';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Unable to place call', 'Could not open phone dialer.');
    });
  }, []);

  const renderMessageItem = useCallback(
    ({ item }: { item: MessageRenderItem }) => {
      switch (item.type) {
        case 'date_divider':
          return <MessageTimestamp label={item.label} />;

        case 'system':
          return <SystemMessage content={item.content} />;

        case 'message':
          return (
            <MessageBubble
              item={item}
              workerAvatarUrl={booking?.worker_avatar_url}
              onRetry={retrySendMessage}
            />
          );

        default:
          return null;
      }
    },
    [booking?.worker_avatar_url, retrySendMessage]
  );

  const workerName =
    booking?.worker_name ||
    (booking?.category_name ? `Assigned ${booking.category_name.replace(/s$/i, '')}` : 'Assigned Professional');

  return (
    <View style={styles.container}>
      {/* Fixed Chat Header */}
      <ChatHeader
        workerName={workerName}
        workerAvatarUrl={booking?.worker_avatar_url}
        isOnline={true}
        workerPhone="+92 300 1234567"
        onCallPress={handleCallPress}
      />

      {/* Main Conversation Container with Inverted FlatList */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {isLoading ? (
          <ChatSkeleton />
        ) : (
          <FlatList
            data={renderItems}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            inverted
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          />
        )}

        {/* Real-time Typing Indicator (above input bar) */}
        {isWorkerTyping && <TypingIndicator />}

        {/* Closed Room Notice */}
        {isRoomClosed ? (
          <View style={styles.closedBanner}>
            <SystemMessage content="This conversation is closed because the booking is completed or cancelled." />
          </View>
        ) : (
          /* Fixed Expanding Chat Input */
          <ChatInput
            onSend={handleSend}
            onTyping={notifyTyping}
            onStopTyping={stopTypingImmediately}
            disabled={isLoading || isRoomClosed}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
  },
  closedBanner: {
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
