import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';

import { useCurrentUser } from '../../src/hooks/useProfile';
import { useLogout } from '../../src/hooks/useLogout';
import { useDeleteAccount } from '../../src/hooks/useDeleteAccount';
import { PROFILE_MENU_SECTIONS } from '../../src/config/profileMenu.config';
import { ProfileMenuItemConfig } from '../../src/types/user.types';
import { ProfileHeader } from '../../src/components/profile/ProfileHeader';
import { ProfileStatsRow } from '../../src/components/profile/ProfileStatsRow';
import { ProfileMenuSection } from '../../src/components/profile/ProfileMenuSection';
import { LogoutConfirmSheet, showNativeLogoutActionSheet } from '../../src/components/feedback/LogoutConfirmSheet';
import { DeleteAccountSheet } from '../../src/components/feedback/DeleteAccountSheet';
import { DeleteAccountReason } from '../../src/types/moderation.types';
import { colors, palette, fontFamily, fontSize, radius, spacing, shadows } from '../../src/design';

/**
 * ProfileScreen (Day 35, 37 & 38 Profile & Account Control Hub)
 *
 * Implements Principal-level React Native & UX Architecture:
 * - Instant cached loads (5-min staleTime) with background refetch
 * - Data-driven menu sections (Serial Position & Hick's Law)
 * - Standalone routine Log Out row with calm 2-option sheet
 * - High-Friction 2-Step Delete Account flow with Peak-End goodbye screen
 */
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user, isRefetching, refetch } = useCurrentUser();
  const { logout, isLoggingOut } = useLogout();
  const { deleteAccount, isDeleting } = useDeleteAccount();

  const [logoutModalVisible, setLogoutModalVisible] = useState<boolean>(false);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState<boolean>(false);

  const handleTriggerLogout = () => {
    const handledByNativeIOS = showNativeLogoutActionSheet(() => logout());
    if (!handledByNativeIOS) {
      setLogoutModalVisible(true);
    }
  };

  // Handle menu item interactions
  const handleMenuItemPress = useCallback(
    async (item: ProfileMenuItemConfig) => {
      if (item.route) {
        router.push(item.route as any);
        return;
      }

      if (item.action === 'logout') {
        handleTriggerLogout();
        return;
      }

      if (item.action === 'delete_account') {
        setDeleteSheetVisible(true);
        return;
      }

      if (item.action === 'contact_support') {
        router.push('/profile/support' as any);
        return;
      }

      if (item.action === 'rate_app') {
        const iosStoreUrl = 'https://apps.apple.com/app/id6440000000?action=write-review';
        const androidStoreUrl = 'market://details?id=pk.tasklync.customer';
        try {
          const url = Platform.OS === 'ios' ? iosStoreUrl : androidStoreUrl;
          await Linking.openURL(url);
        } catch {}
        return;
      }

      if (item.action === 'open_link' && item.externalUrl) {
        try {
          await Linking.openURL(item.externalUrl);
        } catch {}
      }
    },
    [router]
  );

  const handleConfirmDelete = async (reason?: DeleteAccountReason) => {
    await deleteAccount(reason);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgApp} />

      {/* Screen Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Profile Header Anchor */}
        <ProfileHeader
          user={user}
          onEditPress={() => router.push('/profile/edit' as any)}
        />

        {/* 2. Stats Summary Row */}
        <ProfileStatsRow stats={user?.stats} />

        {/* 3. Data-Driven Menu Sections */}
        {PROFILE_MENU_SECTIONS.map((section) => (
          <ProfileMenuSection
            key={section.id}
            section={section}
            onPressItem={handleMenuItemPress}
          />
        ))}

        {/* 4. Standalone Log Out Button (Routine & Reversible) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutButton}
          onPress={handleTriggerLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out of Tasklync"
        >
          <LogOut size={18} color={colors.textSecondary} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* 5. Version & Security Footer */}
        <View style={styles.footerNote}>
          <Text style={styles.versionText}>Tasklync v1.0.0 (Build 38)</Text>
          <Text style={styles.copyText}>Escrow-Protected Home Services Platform</Text>
        </View>
      </ScrollView>

      {/* Confirmation Dialogs */}
      <LogoutConfirmSheet
        visible={logoutModalVisible}
        onConfirm={async () => {
          setLogoutModalVisible(false);
          await logout();
        }}
        onCancel={() => setLogoutModalVisible(false)}
        isLoading={isLoggingOut}
      />

      <DeleteAccountSheet
        visible={deleteSheetVisible}
        onClose={() => setDeleteSheetVisible(false)}
        onDeleteAccount={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.bgApp,
  },
  headerTitle: {
    fontFamily: fontFamily.poppins.bold,
    fontSize: fontSize.h2,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    ...shadows.xs,
  },
  logoutButtonText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: fontSize.body2 + 0.5,
    color: colors.textSecondary,
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 2,
  },
  versionText: {
    fontFamily: fontFamily.inter.medium,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  copyText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.nano + 1,
    color: palette.gray400,
  },
});
