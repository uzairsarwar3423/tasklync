import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { OnlineBadge } from '../ui/Badge/OnlineBadge';
import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { typography } from '../../design/typography';
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
  avgResponseMins,
  style,
}) => {
  const getCardStyle = () => {
    switch (status) {
      case 'AVAILABLE':
        return {
          containerBg: colors.bgSuccess || '#F0FDF4',
          borderColor: colors.primaryBorder || '#BBF7D0',
          dotStatus: 'online' as const,
          titleColor: colors.online || '#16A34A',
          title: 'Available now',
          subtitle: `Until ${availableUntil || '6:00 PM'} · Responds in ~${avgResponseMins} min`,
        };
      case 'BUSY':
        return {
          containerBg: '#FEF3C7', // Amber light
          borderColor: colors.busy || '#D97706',
          dotStatus: 'busy' as const,
          titleColor: '#D97706',
          title: 'On a job',
          subtitle: 'Usually free in 1-2 hours · Responds in ~15 min',
        };
      case 'PAUSED':
        return {
          containerBg: colors.bgSection || '#F3F4F6',
          borderColor: colors.border || '#E5E7EB',
          dotStatus: 'offline' as const,
          titleColor: colors.textMuted || '#6B7280',
          title: 'Paused',
          subtitle: 'Accepting bookings from Thursday',
        };
      case 'OFFLINE':
      default:
        return {
          containerBg: colors.bgSection || '#F3F4F6',
          borderColor: colors.border || '#E5E7EB',
          dotStatus: 'offline' as const,
          titleColor: colors.textMuted || '#6B7280',
          title: 'Offline',
          subtitle: `Available ${nextAvailable || 'tomorrow at 9:00 AM'}`,
        };
    }
  };

  const config = getCardStyle();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.containerBg,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <OnlineBadge status={config.dotStatus} size={8} style={styles.dot} />
        <Text style={[styles.title, { color: config.titleColor }]}>
          {config.title}
        </Text>
      </View>
      <Text style={styles.subtitle}>{config.subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    marginRight: 8,
  },
  title: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    fontSize: 13,
  },
  subtitle: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 12,
    color: colors.textMuted || '#6B7280',
    paddingLeft: 16, // offset dot
  },
});
