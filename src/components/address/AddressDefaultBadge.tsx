import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, palette, fontFamily } from '../../design';

export const AddressDefaultBadge: React.FC = () => {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>Default</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: palette.green50,
    borderWidth: 1,
    borderColor: palette.green200,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  text: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 10,
    lineHeight: 14,
    color: colors.primaryDark,
  },
});
