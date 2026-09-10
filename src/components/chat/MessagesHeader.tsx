import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationBell } from '../home/NotificationBell';
import { colors } from '../../design/colors';
import { fontFamily } from '../../design/typography';

interface MessagesHeaderProps {
  totalUnreadCount?: number;
}

export const MessagesHeader: React.FC<MessagesHeaderProps> = ({ totalUnreadCount = 0 }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Messages</Text>
        {totalUnreadCount > 0 && (
          <View style={styles.unreadPill}>
            <Text style={styles.unreadPillText}>
              {totalUnreadCount} new
            </Text>
          </View>
        )}
      </View>
      <NotificationBell />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 24,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  unreadPill: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  unreadPillText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 12,
    color: colors.primaryDark,
  },
});
