import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  MapPin,
  Bell,
  Globe,
  Headphones,
  Star,
  FileText,
  Trash2,
  ChevronRight,
  LogOut,
  ShieldAlert,
  CreditCard,
  Settings,
  HelpCircle,
  Clock,
  UserX,
} from 'lucide-react-native';
import { ProfileMenuItemConfig } from '../../types/user.types';
import { colors, palette, fontFamily, fontSize, radius, spacing } from '../../design';

export interface ProfileMenuItemProps {
  item: ProfileMenuItemConfig;
  onPress: (item: ProfileMenuItemConfig) => void;
  isLast?: boolean;
}

const renderIcon = (iconName: string, isDanger: boolean) => {
  const iconColor = isDanger ? colors.textDanger : colors.primaryDark;
  const iconSize = 18;

  switch (iconName) {
    case 'MapPin':
      return <MapPin size={iconSize} color={iconColor} />;
    case 'Bell':
      return <Bell size={iconSize} color={iconColor} />;
    case 'Globe':
      return <Globe size={iconSize} color={iconColor} />;
    case 'Headphones':
      return <Headphones size={iconSize} color={iconColor} />;
    case 'HelpCircle':
      return <HelpCircle size={iconSize} color={iconColor} />;
    case 'Star':
      return <Star size={iconSize} color={iconColor} />;
    case 'FileText':
      return <FileText size={iconSize} color={iconColor} />;
    case 'Trash2':
      return <Trash2 size={iconSize} color={iconColor} />;
    case 'LogOut':
      return <LogOut size={iconSize} color={iconColor} />;
    case 'CreditCard':
      return <CreditCard size={iconSize} color={iconColor} />;
    case 'Settings':
      return <Settings size={iconSize} color={iconColor} />;
    case 'Clock':
      return <Clock size={iconSize} color={iconColor} />;
    case 'UserX':
      return <UserX size={iconSize} color={iconColor} />;
    default:
      return <ShieldAlert size={iconSize} color={iconColor} />;
  }
};

/**
 * ProfileMenuItem Component (Day 35)
 *
 * Implements Fitts's Law & Recognition over Recall:
 * - 52px minimum height tap target
 * - Consistent destination icons
 * - Danger tone styling for destructive options
 */
export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  item,
  onPress,
  isLast = false,
}) => {
  const isDanger = item.tone === 'danger';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.label}, ${item.subtitle || ''}`}
    >
      {/* Icon Pill */}
      <View style={[styles.iconContainer, isDanger && styles.iconContainerDanger]}>
        {renderIcon(item.icon, isDanger)}
      </View>

      {/* Label & Subtitle Text Col */}
      <View style={styles.textCol}>
        <Text style={[styles.label, isDanger && styles.labelDanger]}>{item.label}</Text>
        {item.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right Accessory (Badge or Chevron) */}
      <View style={styles.rightAccessory}>
        {item.badge ? (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : (
          <ChevronRight size={18} color={isDanger ? colors.textDanger : colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52, // Fitts's Law
    paddingVertical: spacing.sm + 3,
    paddingHorizontal: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.gray100,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.md - 2,
    backgroundColor: palette.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md - 2,
  },
  iconContainerDanger: {
    backgroundColor: palette.dangerLight,
  },
  textCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: fontSize.body2 + 0.5,
    color: colors.textPrimary,
    marginBottom: 1,
  },
  labelDanger: {
    color: colors.textDanger,
  },
  subtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.caption - 0.5,
    color: colors.textMuted,
  },
  rightAccessory: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    backgroundColor: palette.green50,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontFamily: fontFamily.inter.bold,
    fontSize: fontSize.nano + 1,
    color: colors.primaryDark,
  },
});
