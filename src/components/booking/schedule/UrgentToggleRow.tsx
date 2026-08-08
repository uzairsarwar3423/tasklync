import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Zap } from 'lucide-react-native';
import { UrgentPriceBadge } from './UrgentPriceBadge';
import { colors, palette, fontFamily } from '../../../design';

export interface UrgentToggleRowProps {
  isUrgent: boolean;
  onToggle: (value: boolean) => void;
}

export const UrgentToggleRow: React.FC<UrgentToggleRowProps> = ({
  isUrgent,
  onToggle,
}) => {
  const handleValueChange = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(value);
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
          <Zap size={18} color={palette.warningDark} strokeWidth={2.4} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Urgent (within 2 hrs)</Text>
            <UrgentPriceBadge visible={isUrgent} badgeText="+30%" />
          </View>
          <Text style={styles.sublabel}>
            Priority dispatch for immediate arrival
          </Text>
        </View>
      </View>

      <Switch
        value={isUrgent}
        onValueChange={handleValueChange}
        trackColor={{ false: palette.gray200, true: colors.primary }}
        thumbColor={palette.white}
        ios_backgroundColor={palette.gray200}
        accessibilityRole="switch"
        accessibilityLabel="Urgent booking toggle"
        accessibilityState={{ checked: isUrgent }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 14,
    padding: 14,
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.gray200,
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  sublabel: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    marginTop: 2,
  },
});
