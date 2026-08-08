import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { BookingAddress, useBookingDraftStore } from '../../store/bookingDraft.store';
import { useAddresses } from '../../hooks/useAddresses';
import { AddressCard } from './AddressCard';
import { AddressSkeletonCard } from './AddressSkeletonCard';

export interface AddressListProps {
  selectedAddressId: string | null;
  onSelectAddress: (address: BookingAddress) => void;
}

export const AddressList: React.FC<AddressListProps> = ({
  selectedAddressId,
  onSelectAddress,
}) => {
  const { addresses, isLoading } = useAddresses();
  const setAddressStore = useBookingDraftStore((s) => s.setAddress);

  // Auto-select default address if no address is selected yet
  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setAddressStore(defaultAddr);
    }
  }, [addresses, selectedAddressId, setAddressStore]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <AddressSkeletonCard key={`addr-skel-${idx}`} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={addresses}
        estimatedItemSize={88}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            isSelected={selectedAddressId === item.id}
            onSelect={onSelectAddress}
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
