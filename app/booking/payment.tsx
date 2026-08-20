import { useState, useRef } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Design system
import { palette } from '../../src/design';

// Hooks & APIs
import { useCartStore } from '../../src/store/cart.store';
import { useBookingEstimate } from '../../src/hooks/useBookingEstimate';
import { useBookingDetails } from '../../src/hooks/useBookingDetails';
import { usePaymentMethods } from '../../src/hooks/usePaymentMethods';
import { usePayment } from '../../src/hooks/usePayment';
import { SavedPaymentMethod } from '../../src/services/api/payment.api';

// Components
import { BookingFooterCTA } from '../../src/components/booking/BookingFooterCTA';
import { PaymentHeader } from '../../src/components/payment/PaymentHeader';
import { PaymentAmountCard } from '../../src/components/payment/PaymentAmountCard';
import { PaymentMethodList } from '../../src/components/payment/PaymentMethodList';
import { AddNewCardRow } from '../../src/components/payment/AddNewCardRow';
import { SecurePaymentBadge } from '../../src/components/payment/SecurePaymentBadge';
import { AddCardBottomSheet } from '../../src/components/payment/AddCardBottomSheet';
import { BottomSheetRef } from '../../src/components/layout/BottomSheet/BottomSheet';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = params.bookingId || null;

  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const clearCart = useCartStore((s) => s.clearCart);

  // Derived price calculation hook & live booking details
  const { total: estimateTotal } = useBookingEstimate();
  const { booking } = useBookingDetails(bookingId);

  // Single source of truth for total amount to pay (from backend booking or estimate)
  const amountToPay = booking?.estimated_total || estimateTotal || 0;

  // Payment methods hook
  const { methods } = usePaymentMethods();

  // Selected payment method state
  const [selectedMethod, setSelectedMethod] = useState<SavedPaymentMethod | null>(
    methods.find((m) => m.isDefault) || methods[0] || null
  );

  // Custom added cards list
  const [customCards, setCustomCards] = useState<SavedPaymentMethod[]>([]);

  // Process payment hook
  const { processPayment, isLoading } = usePayment();

  const handleSelectMethod = (method: SavedPaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleOpenAddCardSheet = () => {
    bottomSheetRef.current?.open();
  };

  const handleAddCustomCard = (newCard: SavedPaymentMethod) => {
    setCustomCards((prev) => [newCard, ...prev]);
    setSelectedMethod(newCard);
  };

  const handlePay = async () => {
    const targetMethodId = selectedMethod?.id || 'CASH';

    const success = await processPayment(amountToPay, targetMethodId, bookingId);

    if (success) {
      clearCart();
      // Auto-navigate directly to success screen on payment confirmation
      router.push({
        pathname: '/booking/success',
        params: { bookingId: bookingId || `b-${Date.now().toString(16)}` },
      } as any);
    } else {
      Alert.alert('Payment Error', 'Payment processing failed. Please try again.');
    }
  };

  const isCash = selectedMethod?.id === 'CASH' || selectedMethod?.type === 'cash';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Screen Header */}
        <PaymentHeader />

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Total Amount Card */}
          <PaymentAmountCard total={amountToPay} />

          {/* Saved Payment Cards List */}
          <PaymentMethodList
            selectedMethodId={selectedMethod?.id || null}
            onSelectMethod={handleSelectMethod}
            extraMethods={customCards}
          />

          {/* Add New Card Button (Opens Bottom Sheet Modal) */}
          <AddNewCardRow onPress={handleOpenAddCardSheet} />

          {/* Static Security Badge */}
          <SecurePaymentBadge />

          {/* Bottom Spacer for Sticky Footer */}
          <View style={styles.footerSpacer} />
        </ScrollView>

        {/* Sticky Primary Payment Footer CTA */}
        <BookingFooterCTA
          label={isCash ? 'Confirm Booking (Cash on Delivery)' : `Pay Rs. ${amountToPay.toLocaleString()}`}
          subtext={isCash ? `Pay Rs. ${amountToPay.toLocaleString()} after service` : 'Secure Encrypted Transaction'}
          enabled={true}
          loading={isLoading}
          onPress={handlePay}
          accessibilityLabel={`Confirm payment for rupees ${amountToPay.toLocaleString()}`}
        />

        {/* Add Card Bottom Sheet Modal */}
        <AddCardBottomSheet ref={bottomSheetRef} onAddCard={handleAddCustomCard} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.white,
  },
  container: {
    flex: 1,
    backgroundColor: palette.zenWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  footerSpacer: {
    height: 100,
  },
});
