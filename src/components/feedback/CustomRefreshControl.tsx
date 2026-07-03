import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { colors } from '../../design/colors';

export const CustomRefreshControl: React.FC<RefreshControlProps> = (props) => {
  return (
    <RefreshControl
      tintColor={colors.primary}
      colors={[colors.primary]}
      progressBackgroundColor={colors.bgCard}
      {...props}
    />
  );
};
