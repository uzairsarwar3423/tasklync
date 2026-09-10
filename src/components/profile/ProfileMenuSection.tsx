import { View, Text, StyleSheet } from 'react-native';
import { ProfileMenuSectionConfig, ProfileMenuItemConfig } from '../../types/user.types';
import { ProfileMenuItem } from './ProfileMenuItem';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '../../design';

export interface ProfileMenuSectionProps {
  section: ProfileMenuSectionConfig;
  onPressItem: (item: ProfileMenuItemConfig) => void;
}

/**
 * ProfileMenuSection Component (Day 35)
 *
 * Implements Hick's Law:
 * - Visually chunks menu items into distinct sections
 * - Consistent card containers with clear headings
 */
export const ProfileMenuSection: React.FC<ProfileMenuSectionProps> = ({
  section,
  onPressItem,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{section.sectionTitle}</Text>

      <View style={styles.card}>
        {section.items.map((item, index) => (
          <ProfileMenuItem
            key={item.id}
            item={item}
            onPress={onPressItem}
            isLast={index === section.items.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.xs,
  },
});
