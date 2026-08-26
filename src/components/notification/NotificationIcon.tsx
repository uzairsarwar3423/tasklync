import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import {
  Bell,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Star,
  Sparkles,
  MapPin,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react-native';

export interface NotificationIconProps {
  category?: string | null;
  templateKey?: string | null;
  size?: number;
  containerSize?: number;
  style?: StyleProp<ViewStyle>;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  category = '',
  templateKey = '',
  size = 18,
  containerSize = 42,
  style,
}) => {
  const cat = (category || '').toLowerCase();
  const template = (templateKey || '').toLowerCase();

  // 1. Chat & Instant Messaging
  if (cat.includes('chat') || cat.includes('message') || template.includes('chat') || template.includes('message')) {
    return (
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: '#EFF6FF',
            borderColor: '#DBEAFE',
          },
          style,
        ]}
      >
        <MessageSquare size={size} color="#2563EB" strokeWidth={2.2} />
      </View>
    );
  }

  // 2. Booking Events
  if (cat.includes('booking') || template.startsWith('booking_')) {
    if (template.includes('cancel') || template.includes('reject')) {
      return (
        <View
          style={[
            styles.container,
            {
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
              backgroundColor: '#FEF2F2',
              borderColor: '#FEE2E2',
            },
            style,
          ]}
        >
          <AlertCircle size={size} color="#DC2626" strokeWidth={2.2} />
        </View>
      );
    }

    if (template.includes('complete')) {
      return (
        <View
          style={[
            styles.container,
            {
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
              backgroundColor: '#F0FDF4',
              borderColor: '#DCFCE7',
            },
            style,
          ]}
        >
          <CheckCircle2 size={size} color="#16A34A" strokeWidth={2.2} />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: '#F0FDF4',
            borderColor: '#DCFCE7',
          },
          style,
        ]}
      >
        <CalendarCheck size={size} color="#16A34A" strokeWidth={2.2} />
      </View>
    );
  }

  // 3. Payments & Escrow
  if (cat.includes('payment') || template.startsWith('payment_') || template.includes('payout')) {
    return (
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: '#FEF3C7',
            borderColor: '#FDE68A',
          },
          style,
        ]}
      >
        <CreditCard size={size} color="#D97706" strokeWidth={2.2} />
      </View>
    );
  }

  // 4. Ratings & Reviews
  if (cat.includes('review') || template.includes('review')) {
    return (
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: '#FEF9C3',
            borderColor: '#FEF08A',
          },
          style,
        ]}
      >
        <Star size={size} color="#CA8A04" strokeWidth={2.2} />
      </View>
    );
  }

  // 5. Worker Arrival & Tracking
  if (
    cat.includes('worker') ||
    template.includes('arrived') ||
    template.includes('en_route') ||
    template.includes('track')
  ) {
    return (
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: '#F0FDFA',
            borderColor: '#CCFBF1',
          },
          style,
        ]}
      >
        <MapPin size={size} color="#0D9488" strokeWidth={2.2} />
      </View>
    );
  }

  // 6. Security, Disputes & Platform Alerts
  if (cat.includes('platform') || template.includes('dispute') || template.includes('security')) {
    return (
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: '#FFF1F2',
            borderColor: '#FFE4E6',
          },
          style,
        ]}
      >
        <ShieldAlert size={size} color="#E11D48" strokeWidth={2.2} />
      </View>
    );
  }

  // 7. Marketing & Promos
  if (cat.includes('marketing') || cat.includes('promo') || template.includes('promo') || template.includes('greeting')) {
    return (
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: '#FAF5FF',
            borderColor: '#F3E8FF',
          },
          style,
        ]}
      >
        <Sparkles size={size} color="#9333EA" strokeWidth={2.2} />
      </View>
    );
  }

  // 8. Default System Bell
  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: '#F1F5F9',
          borderColor: '#E2E8F0',
        },
        style,
      ]}
    >
      <Bell size={size} color="#475569" strokeWidth={2.2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
