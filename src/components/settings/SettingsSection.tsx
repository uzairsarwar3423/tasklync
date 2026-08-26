import { Children, isValidElement, Fragment } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, palette, fontFamily, radius, spacing, shadows } from '../../design';

export interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader} maxFontSizeMultiplier={1.3}>
        {title.toUpperCase()}
      </Text>
      <View style={styles.cardContainer}>
        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) return child;
          const isLast = index === Children.count(children) - 1;
          return (
            <Fragment key={index}>
              {child}
              {!isLast && <View style={styles.divider} />}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs + 2,
  },
  cardContainer: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.xs,
  },
  divider: {
    height: 1,
    backgroundColor: palette.gray100,
    marginLeft: spacing.base,
  },
});
