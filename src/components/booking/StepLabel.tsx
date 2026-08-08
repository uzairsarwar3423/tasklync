import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { StepState } from './StepDot';
import { colors, fontFamily } from '../../design';

export interface StepLabelProps {
  label: string;
  state: StepState;
}

export const StepLabel: React.FC<StepLabelProps> = ({ label, state }) => {
  const isHighlight = state === 'active' || state === 'complete';

  return (
    <Text
      numberOfLines={1}
      style={[
        styles.text,
        isHighlight ? styles.textHighlight : styles.textFuture,
      ]}
    >
      {label}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
    textAlign: 'center',
  },
  textHighlight: {
    fontFamily: fontFamily.poppins.semiBold,
    color: colors.textPrimary,
  },
  textFuture: {
    fontFamily: fontFamily.poppins.regular,
    color: colors.textMuted,
  },
});
