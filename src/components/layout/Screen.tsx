import React from 'react';
import { ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '@design/colors';

export interface ScreenProps {
  children: React.ReactNode;
  bg?: string;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  edges?: Edge[];
  style?: ViewStyle;
}

export const Screen = ({
  children,
  bg = colors.bgApp,
  statusBarStyle = 'dark-content',
  edges = ['top', 'bottom', 'left', 'right'],
  style,
}: ScreenProps) => {
  return (
    <SafeAreaView 
      style={[{ flex: 1, backgroundColor: bg }, style]} 
      edges={edges}
    >
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor="transparent" 
        translucent 
      />
      {children}
    </SafeAreaView>
  );
};
