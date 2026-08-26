import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, fontFamily } from '../../design';

export const DefaultAddressBadge: React.FC = () => {
  return (
    <View style={styles.badge} accessibilityLabel="Default address">
      <Text style={styles.badgeText} maxFontSizeMultiplier={1.3}>
        Default
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: palette.green100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: palette.green200,
  },
  badgeText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 11,
    lineHeight: 14,
    color: palette.green800,
  },
});
