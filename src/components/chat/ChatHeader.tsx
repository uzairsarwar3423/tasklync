import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatHeaderProps {
  workerName: string;
  workerAvatarUrl?: string | undefined;
  categoryName?: string | undefined;
  isOnline?: boolean | undefined;
  workerPhone?: string | undefined;
  onCallPress?: () => void;
}

export const ChatHeader = React.memo(function ChatHeader({
  workerName,
  workerAvatarUrl,
  categoryName,
  isOnline = true,
  workerPhone,
  onCallPress,
}: ChatHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const trimmedName = workerName ? workerName.trim() : '';
  const avatarInitial = trimmedName.length > 0 ? trimmedName.charAt(0).toUpperCase() : 'W';

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 44 : 12 }]}>
      <View style={styles.content}>
        {/* Back Button */}
        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color="#111827" />
        </Pressable>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          {workerAvatarUrl ? (
            <Image source={{ uri: workerAvatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{avatarInitial}</Text>
            </View>
          )}

          <View style={styles.textDetails}>
            <Text style={styles.name} numberOfLines={1}>
              {trimmedName || 'Assigned Professional'}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
              <Text style={styles.statusText} numberOfLines={1}>
                {categoryName ? `${categoryName} • ${isOnline ? 'Online' : 'Offline'}` : isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {workerPhone && (
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              onPress={onCallPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Call worker"
              accessibilityRole="button"
            >
              <Phone size={20} color="#16A34A" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    zIndex: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  profileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#16A34A',
  },
  textDetails: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  dotOnline: {
    backgroundColor: '#16A34A',
  },
  dotOffline: {
    backgroundColor: '#9CA3AF',
  },
  statusText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F0FDF4',
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.7,
  },
});
