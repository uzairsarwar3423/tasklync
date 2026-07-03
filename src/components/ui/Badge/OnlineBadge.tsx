import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../../design/colors';

interface OnlineBadgeProps {
  status: 'online' | 'busy' | 'offline';
  size?: number;
  style?: ViewStyle;
}

export const OnlineBadge: React.FC<OnlineBadgeProps> = ({
  status,
  size = 10,
  style,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return colors.online; // Green
      default: return colors.textMuted; // Gray
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <View
        style={[
          styles.solidDot,
          {
            backgroundColor: getStatusColor(),
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidDot: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
