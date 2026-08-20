import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SavedPaymentMethod } from '../../services/api/payment.api';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentMethodSkeleton } from './PaymentMethodSkeleton';

export interface PaymentMethodListProps {
  selectedMethodId: string | null;
  onSelectMethod: (method: SavedPaymentMethod) => void;
  extraMethods?: SavedPaymentMethod[];
}

export const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  selectedMethodId,
  onSelectMethod,
  extraMethods = [],
}) => {
  const { methods: apiMethods, isLoading } = usePaymentMethods();
  const methods = [...extraMethods, ...apiMethods];

  // Auto-select default card if none selected
  useEffect(() => {
    if (!selectedMethodId && methods.length > 0) {
      const defaultMethod = methods.find((m) => m.isDefault) || methods[0];
      onSelectMethod(defaultMethod);
    }
  }, [methods, selectedMethodId, onSelectMethod]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        {Array.from({ length: 2 }).map((_, idx) => (
          <PaymentMethodSkeleton key={`pm-skel-${idx}`} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={methods}
        estimatedItemSize={88}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PaymentMethodCard
            method={item}
            isSelected={selectedMethodId === item.id}
            onSelect={onSelectMethod}
          />
        )}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
