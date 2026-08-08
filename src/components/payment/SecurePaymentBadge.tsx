import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { colors, fontFamily } from '../../design';

export const SecurePaymentBadge: React.FC = () => {
  return (
    <View style={styles.badgeContainer}>
      <Lock size={13} color={colors.textMuted} strokeWidth={2} />
      <Text style={styles.badgeText}>
        256-Bit Encrypted & Secure Payment by Stripe
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
  },
});
