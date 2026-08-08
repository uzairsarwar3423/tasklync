import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Wrench, Calendar, MapPin, ChevronRight, User } from 'lucide-react-native';
import { palette, colors } from '../../src/design';
import { useBookingsList } from '../../src/hooks/useBookingsList';
import { BookingDetails, BookingStatus } from '../../src/types/booking.types';

type FilterTab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const STATUS_COLOR_MAP: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#FEF3C7', text: '#D97706', label: 'Pending Acceptance' },
  ACCEPTED: { bg: '#DBEAFE', text: '#2563EB', label: 'Worker Confirmed' },
  IN_PROGRESS: { bg: '#E0E7FF', text: '#4F46E5', label: 'In Progress' },
  COMPLETED_BY_WORKER: { bg: '#D1FAE5', text: '#059669', label: 'Completed (Pending Review)' },
  COMPLETED: { bg: '#D1FAE5', text: '#059669', label: 'Completed' },
  AUTO_COMPLETED: { bg: '#D1FAE5', text: '#059669', label: 'Auto-Completed' },
  DISPUTED: { bg: '#FFEDD5', text: '#EA580C', label: 'Dispute Open' },
  RESOLVED: { bg: '#F3E8FF', text: '#9333EA', label: 'Resolved' },
  REFUNDED: { bg: '#FEE2E2', text: '#DC2626', label: 'Refunded' },
  REJECTED: { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' },
};

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  let statusFilter: string | undefined = undefined;
  if (activeTab === 'ACTIVE') {
    statusFilter = 'IN_PROGRESS';
  } else if (activeTab === 'COMPLETED') {
    statusFilter = 'COMPLETED';
  } else if (activeTab === 'CANCELLED') {
    statusFilter = 'CANCELLED';
  }

  const { bookings, isLoading, isRefetching, refetch } = useBookingsList({
    status: statusFilter,
  });

  const renderFilterTab = (tab: FilterTab, label: string) => {
    const isSelected = activeTab === tab;
    return (
      <TouchableOpacity
        key={tab}
        style={[styles.tabButton, isSelected && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderBookingItem = ({ item }: { item: BookingDetails }) => {
    const statusConfig = STATUS_COLOR_MAP[item.status] || {
      bg: palette.gray100,
      text: palette.gray700,
      label: item.status,
    };

    const formattedDate = item.scheduled_at
      ? new Date(item.scheduled_at).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Date Pending';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/booking/${item.id}` as any)}
        activeOpacity={0.8}
      >
        {/* Top Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryRow}>
            <Wrench size={16} color={colors.primaryDark} />
            <Text style={styles.categoryName} numberOfLines={1}>
              {item.category_name || item.category_id.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.badgeText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Worker & Location Info */}
        <View style={styles.cardBody}>
          {item.worker_avatar_url ? (
            <Image source={{ uri: item.worker_avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={20} color={palette.gray500} />
            </View>
          )}

          <View style={styles.bodyDetails}>
            <Text style={styles.workerName}>
              {item.worker_name || 'Assigned Professional'}
            </Text>
            <View style={styles.metaRow}>
              <Calendar size={14} color={palette.gray500} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <MapPin size={14} color={palette.gray500} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.address_text}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Footer Price & Action */}
        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>
            Rs. {item.estimated_total ? item.estimated_total.toLocaleString() : '0'}
          </Text>
          <View style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>View Details</Text>
            <ChevronRight size={16} color={colors.primaryDark} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>Track active jobs and view history</Text>
        </View>

        {/* Filter Tabs Header */}
        <View style={styles.tabsContainer}>
          {renderFilterTab('ALL', 'All')}
          {renderFilterTab('ACTIVE', 'Active')}
          {renderFilterTab('COMPLETED', 'Completed')}
          {renderFilterTab('CANCELLED', 'Cancelled')}
        </View>

        {/* Content List */}
        {isLoading && !isRefetching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching bookings...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={palette.gray300} />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptySubtitle}>
              You haven't placed any bookings in this category yet.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)/explore' as any)}
            >
              <Text style={styles.exploreBtnText}>Browse Services</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.white,
  },
  container: {
    flex: 1,
    backgroundColor: palette.zenWhite,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: palette.white,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.gray900,
  },
  subtitle: {
    fontSize: 14,
    color: palette.gray500,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray200,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: palette.gray100,
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.gray600,
  },
  tabTextActive: {
    color: palette.white,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: palette.gray200,
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.gray900,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bodyDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.gray800,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: palette.gray600,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.gray100,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
    marginRight: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: palette.gray600,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.gray800,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: palette.gray500,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
