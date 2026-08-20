import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { BookingAddress, useBookingDraftStore } from '../../store/bookingDraft.store';
import { useAddresses } from '../../hooks/useAddresses';
import { AddressCard } from './AddressCard';
import { AddressSkeletonCard } from './AddressSkeletonCard';
import { colors, palette, fontFamily } from '../../design';

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
        {Array.from({ length: 2 }).map((_, idx) => (
          <AddressSkeletonCard key={`addr-skel-${idx}`} />
        ))}
      </View>
    );
  }

  if (addresses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No saved delivery addresses</Text>
        <Text style={styles.emptySubtext}>Please add your delivery address below to proceed.</Text>
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
  emptyContainer: {
    padding: 20,
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.gray200,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
