import { useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Design system
import { palette } from '../../src/design';

// Stores & Hooks
import { useCartStore } from '../../src/store/cart.store';
import { useBookingDraftStore } from '../../src/store/bookingDraft.store';
import { useBookingEstimate } from '../../src/hooks/useBookingEstimate';
import { useCreateBooking } from '../../src/hooks/useCreateBooking';

// Funnel Primitive & Shared Footer
import { StepProgress } from '../../src/components/booking/StepProgress';
import { BookingFooterCTA } from '../../src/components/booking/BookingFooterCTA';

// Summary Subcomponents
import { ScheduleHeader } from '../../src/components/booking/schedule/ScheduleHeader';
import { SummaryWorkerRow } from '../../src/components/booking/summary/SummaryWorkerRow';
import { SummaryServicesList } from '../../src/components/booking/summary/SummaryServicesList';
import { SummaryScheduleRow } from '../../src/components/booking/summary/SummaryScheduleRow';
import { SummaryAddressRow } from '../../src/components/booking/summary/SummaryAddressRow';
import { DescriptionInput } from '../../src/components/booking/summary/DescriptionInput';
import { BookingPriceSummary } from '../../src/components/booking/BookingPriceSummary';
import { AcceptanceWindowBanner } from '../../src/components/booking/summary/AcceptanceWindowBanner';

export default function SummaryScreen() {
  const router = useRouter();

  // Stores
  const cartItems = useCartStore((s) => s.items);
  const cartWorker = useCartStore((s) => s.worker);
  const clearCart = useCartStore((s) => s.clearCart);

  const {
    selectedDate,
    selectedTimeSlot,
    isUrgent,
    address,
    note,
    setNote,
    hydrate,
  } = useBookingDraftStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Derived estimate hook
  const { subtotal, platformFee, urgentFee, discount, total } = useBookingEstimate();

  // Create booking mutation hook
  const { submit, isLoading, error } = useCreateBooking();

  const handleConfirmBooking = async () => {
    const response = await submit();
    if (response && response.id) {
      // Clear cart on successful booking submission
      clearCart();
      // Navigate directly to success tracking page with no duplicate flash
      router.push({
        pathname: '/booking/payment',
        params: { bookingId: response.id },
      } as any);
    } else if (error) {
      Alert.alert('Booking Error', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Screen Header */}
        <ScheduleHeader
          title="Review & Confirm"
          subtitle="Please double-check your booking details before confirming."
        />

        {/* Funnel Step Progress Primitive (Step 4 of 4: Review) */}
        <StepProgress currentStep={4} />

        {/* Scrollable Content with Fixed Serial Position Order */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Worker Identity Row */}
          <View style={styles.sectionMargin}>
            <SummaryWorkerRow worker={cartWorker} />
          </View>

          {/* 2. Services Requested Row */}
          <View style={styles.sectionMargin}>
            <SummaryServicesList items={cartItems} />
          </View>

          {/* 3. Schedule & Arrival Row */}
          <View style={styles.sectionMargin}>
            <SummaryScheduleRow
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              isUrgent={isUrgent}
            />
          </View>

          {/* 4. Delivery Address Row */}
          <View style={styles.sectionMargin}>
            <SummaryAddressRow address={address} />
          </View>

          {/* 5. Collapsed Special Instructions Note */}
          <DescriptionInput value={note} onChangeText={setNote} />

          {/* 6. Pricing Summary Breakdown */}
          <BookingPriceSummary
            subtotal={subtotal}
            platformFee={platformFee}
            urgentFee={urgentFee}
            discount={discount}
            total={total}
          />

          {/* 7. Acceptance Window Expectations Banner */}
          <AcceptanceWindowBanner />

          {/* Bottom Spacer for Sticky Footer */}
          <View style={styles.footerSpacer} />
        </ScrollView>

        {/* Sticky Primary Confirmation Footer CTA */}
        <BookingFooterCTA
          label="Confirm & Proceed to Pay"
          subtext={`Total: Rs. ${total.toLocaleString()}`}
          enabled={true}
          loading={isLoading}
          onPress={handleConfirmBooking}
          accessibilityLabel={`Confirm booking for total Rs. ${total.toLocaleString()}`}
        />
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
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionMargin: {
    paddingHorizontal: 20,
  },
  footerSpacer: {
    height: 100,
  },
});
