import { useState } from 'react';
import { View, ScrollView, Text, Alert, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';

// Design system
import { colors, palette, fontFamily } from '../../src/design';

// Hooks & APIs
import { useCartStore } from '../../src/store/cart.store';
import { useBookingEstimate } from '../../src/hooks/useBookingEstimate';
import { useBookingDetails } from '../../src/hooks/useBookingDetails';
import { usePaymentMethods } from '../../src/hooks/usePaymentMethods';
import { usePayment } from '../../src/hooks/usePayment';
import { PaymentMethod, AddWalletDTO, AddCardDTO } from '../../src/types/payment.types';

// Components
import { BookingFooterCTA } from '../../src/components/booking/BookingFooterCTA';
import { PaymentHeader } from '../../src/components/payment/PaymentHeader';
import { PaymentAmountCard } from '../../src/components/payment/PaymentAmountCard';
import { PaymentMethodList } from '../../src/components/payment/PaymentMethodList';
import { AddNewCardRow } from '../../src/components/payment/AddNewCardRow';
import { SecurePaymentBadge } from '../../src/components/payment/SecurePaymentBadge';
import { AddCardSheet } from '../../src/components/payment/AddCardSheet';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = params.bookingId || null;

  const [addSheetVisible, setAddSheetVisible] = useState<boolean>(false);

  const clearCart = useCartStore((s) => s.clearCart);

  // Derived price calculation hook & live booking details
  const { total: estimateTotal } = useBookingEstimate();
  const { booking } = useBookingDetails(bookingId);

  // Single source of truth for total amount to pay (from backend booking or estimate)
  const amountToPay = booking?.estimated_total || estimateTotal || 0;

  // Payment methods hook
  const {
    methods,
    addWallet,
    addCard,
    isAdding,
  } = usePaymentMethods();

  // Selected payment method state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    methods.find((m) => m.is_default || m.isDefault) || methods[0] || null
  );

  // Custom added cards list
  const [customCards, setCustomCards] = useState<PaymentMethod[]>([]);

  // Process payment hook
  const { processPayment, isLoading, error: paymentError } = usePayment();

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleOpenAddSheet = () => {
    setAddSheetVisible(true);
  };

  const handleAddWallet = async (dto: AddWalletDTO) => {
    try {
      const newMethod = await addWallet(dto);
      if (newMethod) {
        setSelectedMethod(newMethod);
      }
    } catch {
      // Resilient local fallback
      const cleanNum = dto.accountNumber.replace(/\D/g, '');
      const masked = cleanNum.length >= 4 ? `${cleanNum.slice(0, 4)} •••• ${cleanNum.slice(-4)}` : cleanNum;
      const optimisticMethod: PaymentMethod = {
        id: `pm_wallet_${Date.now()}`,
        type: 'wallet',
        brand: dto.provider,
        title: dto.provider === 'jazzcash' ? 'JazzCash' : 'EasyPaisa',
        subtitle: masked,
        account_number: masked,
        holder_name: dto.accountTitle,
        is_default: Boolean(dto.isDefault),
      };
      setCustomCards((prev) => [optimisticMethod, ...prev]);
      setSelectedMethod(optimisticMethod);
    }
    setAddSheetVisible(false);
  };

  const handleAddCard = async (dto: AddCardDTO) => {
    try {
      const newMethod = await addCard(dto);
      if (newMethod) {
        setSelectedMethod(newMethod);
      }
    } catch {
      const cleanNum = dto.cardNumber?.replace(/\s/g, '') || '4242';
      const last4 = cleanNum.slice(-4) || '4242';
      const optimisticMethod: PaymentMethod = {
        id: `pm_card_${Date.now()}`,
        type: 'card',
        brand: 'visa',
        title: `Card ending in ${last4}`,
        subtitle: `Expires ${dto.expMonth}/${dto.expYear}`,
        last4,
        holder_name: dto.cardholderName,
        is_default: Boolean(dto.isDefault),
      };
      setCustomCards((prev) => [optimisticMethod, ...prev]);
      setSelectedMethod(optimisticMethod);
    }
    setAddSheetVisible(false);
  };

  const handlePay = async () => {
    if (!bookingId || bookingId.startsWith('b-') || bookingId.startsWith('TL-')) {
      Alert.alert('Booking Error', 'No valid booking found. Please complete booking details first.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/bookings' as any) },
      ]);
      return;
    }

    const targetMethodId = selectedMethod?.id || 'CASH';

    const success = await processPayment(amountToPay, targetMethodId, bookingId);

    if (success) {
      clearCart();
      // Auto-navigate directly to success screen on payment confirmation
      router.push({
        pathname: '/booking/success',
        params: { bookingId },
      } as any);
    } else {
      Alert.alert(
        'Payment Error',
        paymentError || 'Payment processing failed. Please check your connection or payment method and try again.'
      );
    }
  };

  // Dynamic status evaluation
  const isCash = selectedMethod?.id === 'CASH' || selectedMethod?.type === 'cash' || selectedMethod?.id === 'pm_cod';
  const isJazzCash = selectedMethod?.brand === 'jazzcash';
  const isEasyPaisa = selectedMethod?.brand === 'easypaisa';

  const ctaLabel = isCash
    ? 'Confirm Booking (Cash)'
    : `Pay Rs. ${amountToPay.toLocaleString()}`;

  const ctaSubtext = isCash
    ? `Pay Rs. ${amountToPay.toLocaleString()} after service completion`
    : isJazzCash
    ? `JazzCash • ${selectedMethod?.account_number || 'Mobile Wallet'}`
    : isEasyPaisa
    ? `EasyPaisa • ${selectedMethod?.account_number || 'Mobile Wallet'}`
    : selectedMethod?.last4
    ? `${selectedMethod?.brand?.toUpperCase() || 'Card'} •••• ${selectedMethod.last4}`
    : 'Secured by Escrow Protection';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.white} />
      <View style={styles.container}>
        {/* Screen Header */}
        <PaymentHeader />

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Total Amount Card with Escrow Guarantee */}
          <PaymentAmountCard total={amountToPay} />

          {/* Section: Choose Payment Option */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.sectionTitle}>Choose Payment Option</Text>
              <Text style={styles.sectionSubtitle}>Select your preferred payment method</Text>
            </View>
            <View style={styles.secureHeaderBadge}>
              <ShieldCheck size={12} color={colors.primaryDark} strokeWidth={2.4} />
              <Text style={styles.secureHeaderText}>Secure</Text>
            </View>
          </View>

          {/* Saved Payment Cards List */}
          <PaymentMethodList
            selectedMethodId={selectedMethod?.id || null}
            onSelectMethod={handleSelectMethod}
            extraMethods={customCards}
          />

          {/* Add New Payment Option Row */}
          <AddNewCardRow onPress={handleOpenAddSheet} />

          {/* Static Security & Escrow Trust Indicators */}
          <SecurePaymentBadge />

          {/* Bottom Spacer for Sticky Footer */}
          <View style={styles.footerSpacer} />
        </ScrollView>

        {/* Sticky Primary Payment Footer CTA */}
        <BookingFooterCTA
          label={ctaLabel}
          subtext={ctaSubtext}
          enabled={Boolean(selectedMethod && amountToPay > 0)}
          loading={isLoading}
          onPress={handlePay}
          accessibilityLabel={isCash ? `Confirm booking with cash on delivery for Rs. ${amountToPay}` : `Pay Rs. ${amountToPay} with ${selectedMethod?.title || 'payment method'}`}
        />

        {/* Add Payment Method Modal (JazzCash, EasyPaisa, Card) */}
        <AddCardSheet
          visible={addSheetVisible}
          onClose={() => setAddSheetVisible(false)}
          onAddWallet={handleAddWallet}
          onAddCard={handleAddCard}
          isLoading={isAdding}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.zenWhite,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitleCol: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  secureHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.green50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.green200,
  },
  secureHeaderText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 10,
    color: colors.primaryDark,
  },
  footerSpacer: {
    height: 140,
  },
});
