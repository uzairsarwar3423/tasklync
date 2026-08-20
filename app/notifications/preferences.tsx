import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, CalendarCheck, CreditCard, MessageSquare, Star, Sparkles, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { notificationApi } from '../../src/services/api/notification.api';
import { CategoryPreference, NotificationCategory } from '../../src/types/notification.types';

const CATEGORY_METADATA: Record<
  NotificationCategory,
  { label: string; description: string; icon: any; color: string }
> = {
  booking: {
    label: 'Booking Updates',
    description: 'Acceptance, start, arrival, and completion alerts',
    icon: CalendarCheck,
    color: '#16A34A',
  },
  payment: {
    label: 'Payments & Receipts',
    description: 'Payment confirmations, refunds, and escrow notices',
    icon: CreditCard,
    color: '#D97706',
  },
  chat: {
    label: 'Direct Messages',
    description: 'Messages and photos from assigned service professionals',
    icon: MessageSquare,
    color: '#2563EB',
  },
  review: {
    label: 'Ratings & Reviews',
    description: 'Feedback requests and review verification',
    icon: Star,
    color: '#CA8A04',
  },
  worker: {
    label: 'Worker Updates',
    description: 'Worker profile and status updates',
    icon: Shield,
    color: '#475569',
  },
  platform: {
    label: 'Platform & Security',
    description: 'Account security and service terms notices',
    icon: Bell,
    color: '#0F172A',
  },
  marketing: {
    label: 'Offers & Promotions',
    description: 'Seasonal discounts and featured service recommendations',
    icon: Sparkles,
    color: '#9333EA',
  },
};

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [preferences, setPreferences] = useState<CategoryPreference[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    notificationApi.getPreferences().then((data) => {
      setPreferences(data);
      setIsLoading(false);
    });
  }, []);

  const handleToggle = useCallback(
    async (
      category: NotificationCategory,
      channel: 'push_enabled' | 'sms_enabled' | 'email_enabled',
      value: boolean
    ) => {
      try {
        Haptics.selectionAsync();
      } catch {}

      // 1. Optimistic UI update
      setPreferences((prev) =>
        prev.map((pref) =>
          pref.category === category ? { ...pref, [channel]: value } : pref
        )
      );

      const target = preferences.find((p) => p.category === category) || {
        category,
        push_enabled: true,
        sms_enabled: true,
        email_enabled: false,
      };

      const payload = {
        ...target,
        [channel]: value,
      };

      await notificationApi.updatePreference(payload);
    },
    [preferences]
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
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

        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeader}>NOTIFICATION CHANNELS BY CATEGORY</Text>

          {preferences.map((pref) => {
            const meta = CATEGORY_METADATA[pref.category as NotificationCategory] || {
              label: pref.category,
              description: 'Notifications for this category',
              icon: Bell,
              color: '#16A34A',
            };
            const Icon = meta.icon;

            return (
              <View key={pref.category} style={styles.preferenceCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: `${meta.color}15` }]}>
                    <Icon size={18} color={meta.color} strokeWidth={2.2} />
                  </View>
                  <View style={styles.cardHeaderTextCol}>
                    <Text style={styles.cardTitle}>{meta.label}</Text>
                    <Text style={styles.cardSubtitle}>{meta.description}</Text>
                  </View>
                </View>

                {/* Toggles */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Push Notifications</Text>
                  <Switch
                    value={pref.push_enabled}
                    onValueChange={(val) => handleToggle(pref.category, 'push_enabled', val)}
                    trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                    thumbColor={pref.push_enabled ? '#16A34A' : '#FFFFFF'}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>SMS Text Messages</Text>
                  <Switch
                    value={pref.sms_enabled}
                    onValueChange={(val) => handleToggle(pref.category, 'sms_enabled', val)}
                    trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                    thumbColor={pref.sms_enabled ? '#16A34A' : '#FFFFFF'}
                  />
                </View>

                <View style={[styles.toggleRow, styles.toggleRowLast]}>
                  <Text style={styles.toggleLabel}>Email Updates</Text>
                  <Switch
                    value={pref.email_enabled}
                    onValueChange={(val) => handleToggle(pref.category, 'email_enabled', val)}
                    trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                    thumbColor={pref.email_enabled ? '#16A34A' : '#FFFFFF'}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
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
  headerRightPlaceholder: {
    width: 38,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toggleRowLast: {
    paddingBottom: 0,
  },
  toggleLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#334155',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
