import React from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ServicePriceTag } from '../service/ServicePriceTag';
import { AddToCartButton } from '../cart/AddToCartButton';
import { Button } from '../ui/Button/Button';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { WorkerServiceOffering } from '../../types/worker.types';

interface WorkerServiceRowProps {
  service: WorkerServiceOffering;
  workerId: string;
  style?: ViewStyle;
}

export const WorkerServiceRow: React.FC<WorkerServiceRowProps> = ({
  service,
  workerId,
  style,
}) => {
  const router = useRouter();

  const handleRowPress = () => {
    Haptics.selectionAsync();
    // Navigate to service detail page
    router.push(`/service/${service.id}` as any);
  };

  const handleQuotePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Get Quote',
      `Would you like to chat with the provider to get a custom quote for ${service.serviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Message', onPress: () => router.push('/chat' as any) },
      ]
    );
  };

  const isQuote = service.priceType === 'quote';

  return (
    <Pressable onPress={handleRowPress} style={[styles.container, style]}>
      <View style={styles.leftGroup}>
        <Text style={styles.nameText} numberOfLines={1}>
          {service.serviceName}
        </Text>
        <Text style={styles.durationText}>
          45–60 min
        </Text>
      </View>
      
      <View style={styles.rightGroup}>
        <ServicePriceTag
          amount={service.customPrice}
          priceType={service.priceType as any}
          size="sm"
          style={styles.priceTag}
        />
        
        {isQuote ? (
          <Button
            variant="secondary"
            size="sm"
            label="Quote"
            onPress={handleQuotePress}
            style={styles.quoteButton}
          />
        ) : (
          <AddToCartButton
            serviceId={service.id}
            serviceName={service.serviceName}
            price={service.customPrice}
            workerId={workerId}
            size="sm"
          />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    width: '100%',
    height: 64,
  },
  leftGroup: {
    flex: 1,
    paddingRight: 12,
  },
  nameText: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    fontSize: 14,
    color: colors.textPrimary || '#0F172A',
    marginBottom: 4,
  },
  durationText: {
    fontFamily: typography.fontFamily.inter.regular,
    fontSize: 12,
    color: colors.textMuted || '#6B7280',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  priceTag: {
    marginRight: 12,
  },
  quoteButton: {
    height: 32,
    paddingHorizontal: 12,
  },
});
