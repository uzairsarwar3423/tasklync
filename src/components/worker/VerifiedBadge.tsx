import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { typography } from '../../design/typography';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  style?: ViewStyle;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'sm',
  showLabel = true,
  style,
}) => {
  const isXs = size === 'xs';
  const isMd = size === 'md';

  const iconSize = isXs ? 12 : isMd ? 14 : 12;

  if (isXs || !showLabel) {
    return (
      <View style={[styles.compactContainer, style]}>
        <ShieldCheck size={iconSize} color={colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badgeContainer,
        isMd ? styles.badgeMd : styles.badgeSm,
        style,
      ]}
    >
      <ShieldCheck size={iconSize} color={colors.textGreen || '#15803D'} style={styles.icon} />
      <Text style={[styles.text, isMd ? styles.textMd : styles.textSm]}>
        Verified Worker
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSuccess || '#F0FDF4',
    borderWidth: 1,
    borderColor: colors.primaryBorder || '#BBF7D0',
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeMd: {
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    color: colors.textGreen || '#15803D',
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 13,
  },
});
