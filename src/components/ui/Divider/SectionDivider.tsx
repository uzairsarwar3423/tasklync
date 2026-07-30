import React from 'react';
import { View, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { colors } from '@design/colors';
import { fontFamily as fonts } from '@design/typography';

interface SectionDividerProps {
  label?: string | null;
  thickness?: number;
  marginV?: number;
  color?: string;
  labelStyle?: TextStyle;
  style?: ViewStyle;
}

export const SectionDivider = ({
  label = null,
  thickness = 1,
  marginV = 24,
  color = colors.border,
  labelStyle,
  style,
}: SectionDividerProps) => {
  if (!label) {
    return (
      <View
        style={[
          styles.line,
          { height: thickness, backgroundColor: color, marginVertical: marginV },
          style,
        ]}
      />
    );
  }

  return (
    <View style={[styles.container, { marginVertical: marginV }, style]}>
      <View style={[styles.flexLine, { height: thickness, backgroundColor: color }]} />
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View style={[styles.flexLine, { height: thickness, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {
    width: '100%',
  },
  flexLine: {
    flex: 1,
  },
  label: {
    paddingHorizontal: 12,
    fontFamily: fonts.jakarta.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
