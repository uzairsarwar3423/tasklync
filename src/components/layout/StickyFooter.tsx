import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@design/colors';

export interface StickyFooterProps {
  children: React.ReactNode;
  noBorder?: boolean;
  bg?: string;
  style?: ViewStyle;
}

export const StickyFooter = ({
  children,
  noBorder = false,
  bg = colors.bgCard,
  style
}: StickyFooterProps) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      style={[
        styles.container,
        {
          backgroundColor: bg,
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopWidth: noBorder ? 0 : 1,
          borderTopColor: colors.border,
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    // Top-only shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    // Elevation for Android
    elevation: 10,
    // This is often needed on Android to show shadow on top only
    ...Platform.select({
      android: {
        borderTopWidth: 1,
      }
    })
  }
});
