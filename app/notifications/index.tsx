import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCheck,
  Bell,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Star,
  Sparkles,
  ChevronRight,
  Inbox,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { notificationApi } from '../../src/services/api/notification.api';
import { useNotificationStore } from '../../src/store/notification.store';
import { NotificationItem } from '../../src/types/notification.types';
import { resolveNotificationRoute } from '../../src/utils/deepLink';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);
  const clearUnread = useNotificationStore((s) => s.clearUnread);

  // 1. Initial Load / Refresh
  const fetchFeed = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await notificationApi.getNotifications(
          null,
          20,
          activeFilter === 'unread'
        );

        setItems(res.data);
        setNextCursor(res.meta.next_cursor || null);
        setHasMore(res.meta.has_more);

        if (res.meta.unread_count !== undefined) {
          setUnreadCount(res.meta.unread_count);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeFilter, setUnreadCount]
  );

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // 2. Keyset Pagination
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor || isLoading) return;
    setIsLoadingMore(true);

    try {
      const res = await notificationApi.getNotifications(
        nextCursor,
        20,
        activeFilter === 'unread'
      );

      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const newUnique = res.data.filter((i) => !existingIds.has(i.id));
        return [...prev, ...newUnique];
      });

      setNextCursor(res.meta.next_cursor || null);
      setHasMore(res.meta.has_more);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextCursor, isLoading, activeFilter]);

  // 3. Mark Single Read & Route
  const handleItemPress = useCallback(
    async (item: NotificationItem) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

      if (!item.is_read) {
        // Optimistic UI update
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
        decrementUnread();
        notificationApi.markAsRead(item.id);
      }

      // Route through deep link resolver
      const targetRoute = resolveNotificationRoute({
        deep_link: item.deep_link || undefined,
        type: item.category,
        template_key: item.template_key,
        ...(item.data || {}),
      });

      if (targetRoute && targetRoute !== '/notifications') {
        try {
          router.push(targetRoute as any);
        } catch {
          // Stay on notifications
        }
      }
    },
    [decrementUnread, router]
  );

  // 4. Mark All Read
  const handleMarkAllRead = useCallback(async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    clearUnread();
    await notificationApi.markAllAsRead();
  }, [clearUnread]);

  // Category Icon Resolver
  const renderCategoryIcon = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('chat') || cat.includes('message')) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
          <MessageSquare size={18} color="#2563EB" strokeWidth={2.2} />
        </View>
      );
    }
    if (cat.includes('booking')) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
          <CalendarCheck size={18} color="#16A34A" strokeWidth={2.2} />
        </View>
      );
    }
    if (cat.includes('payment')) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
          <CreditCard size={18} color="#D97706" strokeWidth={2.2} />
        </View>
      );
    }
    if (cat.includes('review')) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: '#FEF9C3', borderColor: '#FEF08A' }]}>
          <Star size={18} color="#CA8A04" strokeWidth={2.2} />
        </View>
      );
    }
    if (cat.includes('marketing') || cat.includes('promo')) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: '#FAF5FF', borderColor: '#F3E8FF' }]}>
          <Sparkles size={18} color="#9333EA" strokeWidth={2.2} />
        </View>
      );
    }
    return (
      <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
        <Bell size={18} color="#475569" strokeWidth={2.2} />
      </View>
    );
  };

  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => {
      return (
        <Pressable
          style={({ pressed }) => [
            styles.itemCard,
            item.is_read ? styles.itemCardRead : styles.itemCardUnread,
            pressed && styles.itemCardPressed,
          ]}
          onPress={() => handleItemPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${item.body}`}
        >
          {/* Category Icon */}
          {renderCategoryIcon(item.category)}

          {/* Body Content */}
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text
                style={[
                  styles.itemTitle,
                  !item.is_read && styles.itemTitleUnread,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={styles.itemTime}>{formatTimestamp(item.created_at)}</Text>
            </View>

            <Text style={styles.itemBody} numberOfLines={2}>
              {item.body}
            </Text>
          </View>

          {/* Unread Dot or Chevron */}
          {!item.is_read ? (
            <View style={styles.unreadDot} />
          ) : (
            <ChevronRight size={16} color="#CBD5E1" style={styles.chevron} />
          )}
        </Pressable>
      );
    },
    [handleItemPress]
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* App Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>

        <Text style={styles.headerTitle}>Notifications</Text>

        {unreadCount > 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.markAllButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleMarkAllRead}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <CheckCheck size={16} color="#16A34A" style={styles.markAllIcon} />
            <Text style={styles.markAllText}>Mark all</Text>
          </Pressable>
        ) : (
          <View style={styles.headerRightPlaceholder} />
        )}
      </View>

      {/* Filter Tabs (All / Unread) */}
      <View style={styles.filterBar}>
        <Pressable
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterTab, activeFilter === 'unread' && styles.filterTabActive]}
          onPress={() => setActiveFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'unread' && styles.filterTextActive,
            ]}
          >
            Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* Feed Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Inbox size={36} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'unread'
              ? 'You have caught up with all your updates!'
              : 'Updates regarding your bookings and messages will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchFeed(true)}
              tintColor="#16A34A"
              colors={['#16A34A']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#16A34A" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#0F172A',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
  },
  markAllIcon: {
    marginRight: 4,
  },
  markAllText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#16A34A',
  },
  headerRightPlaceholder: {
    width: 38,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: '#0F172A',
  },
  filterText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  filterTextActive: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  itemCardRead: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  itemCardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BBF7D0',
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCardPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: '#F8FAFC',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  itemTitleUnread: {
    color: '#0F172A',
    fontWeight: '700',
  },
  itemTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  itemBody: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginLeft: 10,
  },
  chevron: {
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
