import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserCheck, Edit3 } from 'lucide-react-native';
import { UserProfile } from '../../types/user.types';
import { AvatarUploadRing } from './AvatarUploadRing';
import { colors, palette, fontFamily, fontSize, radius, spacing, shadows } from '../../design';

export interface ProfileHeaderProps {
  user?: UserProfile | null;
  onEditPress: () => void;
}

/**
 * ProfileHeader Component (Day 35)
 *
 * Implements Aesthetic-Usability Effect:
 * - 80px visual anchor avatar
 * - Name in Poppins SemiBold
 * - Verified Customer Badge
 * - Quick "Edit Profile" pill action
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditPress,
}) => {
  const name = user?.name || 'Tasklync Customer';
  const phone = user?.phone || '+92 300 0000000';
  const isVerified = user?.is_verified ?? true;

  return (
    <View style={styles.container}>
      {/* Avatar Anchor */}
      <AvatarUploadRing
        imageUri={user?.avatar_url}
        name={name}
        size={84}
        onPress={onEditPress}
      />

      {/* User Info Block */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {name}
          </Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <UserCheck size={13} color={colors.primaryDark} />
            </View>
          )}
        </View>

        <Text style={styles.userPhone}>{phone}</Text>

        {/* Edit Profile CTA Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.editButton}
          onPress={onEditPress}
          accessibilityRole="button"
          accessibilityLabel="Edit Profile Details"
        >
          <Edit3 size={13} color={colors.primaryDark} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  infoCol: {
    flex: 1,
    marginLeft: spacing.md + 2,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userName: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.body1 + 1,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.green50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.green200,
  },
  userPhone: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs + 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.green50,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 5,
    borderWidth: 1,
    borderColor: palette.green200,
  },
  editButtonText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: fontSize.dataXS,
    color: colors.primaryDark,
  },
});
