import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { colors, palette, fontFamily } from '../../../design';

export const AcceptanceWindowBanner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <View style={styles.iconCircle}>
        <Clock size={16} color={colors.primaryDark} strokeWidth={2.2} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>30-Minute Acceptance Guarantee</Text>
        <Text style={styles.description}>
          Provider has 30 minutes to confirm your request. You won&apos;t be charged until accepted.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.green50,
    borderWidth: 1,
    borderColor: palette.green200,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.primaryDark,
  },
  description: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
