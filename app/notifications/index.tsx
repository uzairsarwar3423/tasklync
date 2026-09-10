import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { ArrowLeft, CheckCheck, BellOff, ChevronRight } from 'lucide-react-native';

import { useNotifications } from '../../src/hooks/useNotifications';
import { useNotificationPermission } from '../../src/hooks/useNotificationPermission';
import { usePushRegistration } from '../../src/hooks/usePushRegistration';
import {
  NotificationItem as NotificationItemType,
  NotificationListItem,
} from '../../src/types/notification.types';
import { NotificationItem } from '../../src/components/notification/NotificationItem';
import { NotificationSwipeRow } from '../../src/components/notification/NotificationSwipeRow';
import { NotificationGroupHeader } from '../../src/components/notification/NotificationGroupHeader';
import { EmptyNotifications } from '../../src/components/feedback/EmptyState/EmptyNotifications';
import { ErrorState } from '../../src/components/feedback/ErrorState';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { resolveNotificationRoute } from '../../src/utils/deepLink';
import { colors } from '../../src/design/colors';

/**
 * NotificationsScreen (Day 32 Notification Center)
 *
 * Implements Principal-level React Native Architecture:
 * - High-performance FlashList with separate recycling item types (header vs notification)
 * - Dynamic sticky header indices computed from pure date grouping transform
 * - Optimistic cache mutations across infinite pages with instant badge reconciliation
 * - 2-zone simultaneous swipe gesture rows (Mark read / Delete)
 * - Safe area & Fitts's Law ergonomics
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();
  const { isGranted, isUndetermined, canAskAgain, request } = useNotificationPermission();
  const { register } = usePushRegistration();

  const {
    groupedList,
    stickyHeaderIndices,
    unreadCount,
    activeFilter,
    setActiveFilter,
    isLoading,
    isFetchingNextPage,
    isError,
    isRefreshing,
    hasNextPage,
    fetchNextPage,
    refetch,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications();

  const handleEnablePush = useCallback(async () => {
    if (isUndetermined || canAskAgain) {
      const res = await request();
      if (res === 'granted') {
        await register();
      }
    } else {
      Linking.openSettings().catch(() => {});
    }
  }, [isUndetermined, canAskAgain, request, register]);

  // Navigation & Deep Linking Handler
  const handleItemPress = useCallback(
    (item: NotificationItemType) => {

      // 1. Optimistic read mark
      if (!item.is_read) {
        markRead(item.id);
      }

      // 2. Resolve destination path
      const targetRoute = resolveNotificationRoute({
        deep_link: item.deep_link ?? undefined,
        type: item.category,
        template_key: item.template_key,
        ...(item.data || {}),
      });

      if (targetRoute && targetRoute !== '/notifications') {
        try {
          router.push(targetRoute as any);
        } catch {
          // Fallback: stay on feed
        }
      }
    },
    [markRead, router]
  );

  const handleFilterChange = useCallback(
    (filter: 'all' | 'unread') => {
      setActiveFilter(filter);
    },
    [setActiveFilter]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  // FlashList Render Item
  const renderItem = useCallback(
    ({ item }: { item: NotificationListItem }) => {
      if (item.type === 'header') {
        return <NotificationGroupHeader title={item.title} count={item.count} />;
      }

      return (
        <NotificationSwipeRow
          item={item.notification}
          onMarkRead={markRead}
          onDelete={deleteNotification}
        >
          <NotificationItem
            item={item.notification}
            onPress={handleItemPress}
          />
        </NotificationSwipeRow>
      );
    },
    [deleteNotification, handleItemPress, markRead]
  );

  const getItemType = useCallback((item: NotificationListItem) => {
    return item.type;
  }, []);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
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
            onPress={markAllRead}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <CheckCheck size={16} color="#16A34A" style={styles.markAllIcon} />
            <Text style={styles.markAllText}>Mark all</Text>
          </Pressable>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      {/* Filter Tabs (All / Unread) */}
      <View style={styles.filterBar}>
        <Pressable
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => handleFilterChange('all')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeFilter === 'all' }}
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
          onPress={() => handleFilterChange('unread')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeFilter === 'unread' }}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'unread' && styles.filterTextActive,
            ]}
          >
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* Push Permission Recovery Banner */}
      {!isGranted && (
        <Pressable
          style={styles.permissionBanner}
          onPress={handleEnablePush}
          accessibilityRole="button"
          accessibilityLabel="Enable push notifications"
        >
          <View style={styles.permissionIconCircle}>
            <BellOff size={16} color="#DC2626" />
          </View>
          <View style={styles.permissionTextCol}>
            <Text style={styles.permissionTitle}>Push notifications are disabled</Text>
            <Text style={styles.permissionSubtitle}>
              Tap to enable real-time booking alerts and messages
            </Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </Pressable>
      )}

      {/* Main FlashList Feed */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : isError && groupedList.length === 0 ? (
        <ErrorState
          type={isOffline ? 'offline' : 'error'}
          title={isOffline ? 'No internet connection' : "Couldn't load notifications"}
          subtitle={
            isOffline
              ? 'Please check your connection and pull to refresh.'
              : 'An unexpected error occurred while fetching your notifications.'
          }
          onRetry={refetch}
          retryButtonText="Retry"
        />
      ) : (
        <FlashList
          data={groupedList}
          renderItem={renderItem}
          getItemType={getItemType}
          keyExtractor={(item) => item.id}
          stickyHeaderIndices={stickyHeaderIndices}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor="#16A34A"
              colors={['#16A34A']}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyNotifications isFiltered={activeFilter === 'unread'} />
            ) : null
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
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
    backgroundColor: colors.bgApp,
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
  headerPlaceholder: {
    width: 38,
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
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  permissionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  permissionTextCol: {
    flex: 1,
  },
  permissionTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#991B1B',
  },
  permissionSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
