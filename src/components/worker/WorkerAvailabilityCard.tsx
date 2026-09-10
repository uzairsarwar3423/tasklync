import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Zap, Clock, ChevronRight } from 'lucide-react-native';
import { fontFamily } from '../../design/typography';
import { WorkerAvailabilityStatus } from '../../types/worker.types';

interface WorkerAvailabilityCardProps {
  status: WorkerAvailabilityStatus;
  availableUntil?: string | null;
  nextAvailable?: string | null;
  avgResponseMins: number;
  style?: ViewStyle;
}

export const WorkerAvailabilityCard: React.FC<WorkerAvailabilityCardProps> = ({
  status,
  availableUntil = null,
  nextAvailable = null,
  avgResponseMins = 30,
  style,
}) => {
  const isAvailable = status === 'AVAILABLE';
  const isBusy = status === 'BUSY';

  const getTheme = () => {
    if (isAvailable) {
      return {
        bg: '#F0FDF4',
        border: '#DCFCE7',
        iconBg: '#DCFCE7',
        iconColor: '#16A34A',
        titleColor: '#15803D',
        title: 'Available now',
        subtitle: avgResponseMins > 0 ? `Usually responds within ${avgResponseMins} minutes` : 'Ready for new bookings',
      };
    }
    if (isBusy) {
      return {
        bg: '#FEF3C7',
        border: '#FDE68A',
        iconBg: '#FDE68A',
        iconColor: '#D97706',
        titleColor: '#B45309',
        title: 'Currently on a job',
        subtitle: 'Currently serving another booking',
      };
    }
    return {
      bg: '#F8FAFC',
      border: '#E2E8F0',
      iconBg: '#E2E8F0',
      iconColor: '#64748B',
      titleColor: '#475569',
      title: 'Offline',
      subtitle: nextAvailable ? `Available ${nextAvailable}` : 'Currently offline',
    };
  };

  const theme = getTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <View style={styles.leftGroup}>
        <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
          {isAvailable ? (
            <Zap size={16} color={theme.iconColor} fill={theme.iconColor} />
          ) : (
            <Clock size={16} color={theme.iconColor} />
          )}
        </View>

        <View style={styles.textGroup}>
          <Text style={[styles.title, { color: theme.titleColor }]}>
            {theme.title}
          </Text>
          <Text style={styles.subtitle}>{theme.subtitle}</Text>
        </View>
      </View>

      <ChevronRight size={18} color={theme.iconColor} strokeWidth={2.2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 12.5,
    color: '#64748B',
  },
});
