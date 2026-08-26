import { View, StyleSheet } from 'react-native';
import { ToggleRow } from './ToggleRow';
import { NotificationPreferences, NotificationPrefKey } from '../../types/settings.types';
import { palette, spacing } from '../../design';

export interface NotificationPreferenceGroupProps {
  preferences: NotificationPreferences;
  onToggle: (key: NotificationPrefKey) => void;
}

export const NotificationPreferenceGroup: React.FC<NotificationPreferenceGroupProps> = ({
  preferences,
  onToggle,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Push Notifications */}
      <ToggleRow
        label="Booking Updates"
        subtitle="Real-time alerts for worker en route, arrival, and job completion"
        value={preferences.push.booking_updates}
        onValueChange={() => onToggle('push.booking_updates')}
      />

      <View style={styles.divider} />

      <ToggleRow
        label="Chat Messages"
        subtitle="Instant notifications for messages from assigned service professionals"
        value={preferences.push.chat_messages}
        onValueChange={() => onToggle('push.chat_messages')}
      />

      <View style={styles.divider} />

      <ToggleRow
        label="Promotions & Offers"
        subtitle="Exclusive discounts, seasonal maintenance tips, and promo codes"
        value={preferences.push.promotions}
        onValueChange={() => onToggle('push.promotions')}
      />

      <View style={styles.divider} />

      {/* 2. SMS Notifications */}
      <ToggleRow
        label="SMS Confirmations Only"
        subtitle="Important booking SMS alerts and security one-time passwords"
        value={preferences.sms.booking_confirmations}
        onValueChange={() => onToggle('sms.booking_confirmations')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  divider: {
    height: 1,
    backgroundColor: palette.gray100,
    marginLeft: spacing.base,
  },
});
