import { View, StyleSheet } from 'react-native';
import { statusToColor } from '../../utils/bookingStatus';
import { BookingStatus } from '../../types/booking.types';

export interface StatusDotProps {
  status: BookingStatus | string;
  size?: number;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, size = 8 }) => {
  const dotColor = statusToColor(status);

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dotColor,
        },
      ]}
      accessibilityRole="none"
      importantForAccessibility="no"
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    flexShrink: 0,
  },
});
