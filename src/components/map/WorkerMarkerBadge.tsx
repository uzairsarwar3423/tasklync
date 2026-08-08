import { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Zap,
  Wrench,
  AirVent,
  Sparkles,
  Palette,
  Hammer,
  Car,
  Scissors,
  HelpCircle,
} from 'lucide-react-native';
import { colors } from '../../design/colors';

interface WorkerMarkerBadgeProps {
  category?: string;
  size?: number;
}

export const getCategoryMeta = (category?: string) => {
  const normalized = (category || '').toLowerCase();

  if (normalized.includes('electr')) {
    return { icon: Zap, bg: '#FEF3C7', color: '#D97706', label: 'Electrician' };
  }
  if (normalized.includes('plumb')) {
    return { icon: Wrench, bg: '#E0F2FE', color: '#0284C7', label: 'Plumber' };
  }
  if (normalized.includes('ac') || normalized.includes('air') || normalized.includes('hvac')) {
    return { icon: AirVent, bg: '#E0E7FF', color: '#4F46E5', label: 'AC Repair' };
  }
  if (normalized.includes('clean')) {
    return { icon: Sparkles, bg: '#F0FDF4', color: '#16A34A', label: 'Cleaner' };
  }
  if (normalized.includes('paint')) {
    return { icon: Palette, bg: '#FCE7F3', color: '#DB2777', label: 'Painter' };
  }
  if (normalized.includes('carpent') || normalized.includes('wood')) {
    return { icon: Hammer, bg: '#FFEDD5', color: '#EA580C', label: 'Carpenter' };
  }
  if (normalized.includes('mechanic') || normalized.includes('auto')) {
    return { icon: Car, bg: '#F3E8FF', color: '#9333EA', label: 'Mechanic' };
  }
  if (normalized.includes('barber') || normalized.includes('salon') || normalized.includes('beauty')) {
    return { icon: Scissors, bg: '#FFE4E6', color: '#E11D48', label: 'Salon' };
  }

  return { icon: HelpCircle, bg: '#F1F5F9', color: '#64748B', label: 'Handyman' };
};

export const WorkerMarkerBadge: FC<WorkerMarkerBadgeProps> = ({
  category,
  size = 18,
}) => {
  const meta = getCategoryMeta(category);
  const IconComponent = meta.icon;
  const iconSize = Math.max(10, Math.floor(size * 0.6));

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: meta.bg,
          borderColor: colors.bgCard,
        },
      ]}
    >
      <IconComponent size={iconSize} color={meta.color} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
