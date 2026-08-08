import { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Design system
import { palette } from '../../src/design';

// Hooks & Stores
import { useCalendarMonth } from '../../src/hooks/useCalendarMonth';
import { useWorkerSlots } from '../../src/hooks/useWorkerSlots';
import { useBookingDraftStore } from '../../src/store/bookingDraft.store';
import { useCartStore } from '../../src/store/cart.store';

// Components
import { StepProgress } from '../../src/components/booking/StepProgress';
import { BookingFooterCTA } from '../../src/components/booking/BookingFooterCTA';

// Schedule Subcomponents
import { ScheduleHeader } from '../../src/components/booking/schedule/ScheduleHeader';
import { CalendarHeader } from '../../src/components/booking/schedule/CalendarHeader';
import { CalendarWeekdayRow } from '../../src/components/booking/schedule/CalendarWeekdayRow';
import { CalendarGrid } from '../../src/components/booking/schedule/CalendarGrid';
import { TimeSlotGrid } from '../../src/components/booking/schedule/TimeSlotGrid';
import { UrgentToggleRow } from '../../src/components/booking/schedule/UrgentToggleRow';

export default function ScheduleScreen() {
  const router = useRouter();

  // Cart store for selected worker info if available
  const cartWorker = useCartStore((s) => s.worker);

  // Booking draft store
  const {
    selectedDate,
    selectedTimeSlot,
    isUrgent,
    setSelectedTimeSlot,
    setIsUrgent,
    setWorkerId,
    hydrate,
  } = useBookingDraftStore();

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Sync worker ID from cart if present
  useEffect(() => {
    if (cartWorker?.id) {
      setWorkerId(cartWorker.id);
    }
  }, [cartWorker, setWorkerId]);

  // Calendar month state hook
  const {
    monthLabel,
    daysArray,
    slideDirection,
    visibleMonth,
    visibleYear,
    canGoPrev,
    nextMonth,
    prevMonth,
    selectDate,
  } = useCalendarMonth(selectedDate || undefined);

  // Time slots hook (re-queries automatically whenever selectedDate or workerId changes)
  const { slots, isLoading } = useWorkerSlots(selectedDate, cartWorker?.id);

  // Navigation action
  const handleContinue = () => {
    // Navigate to next funnel step (Day 23 Address Screen)
    router.push('/booking/address' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Screen Header */}
        <ScheduleHeader />

        {/* Funnel Step Progress Primitive (Step 2 of 4: Schedule) */}
        <StepProgress currentStep={2} />

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Calendar Section */}
          <View style={styles.calendarCard}>
            <CalendarHeader
              monthLabel={monthLabel}
              canGoPrev={canGoPrev}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
            />

            <CalendarWeekdayRow />

            <CalendarGrid
              daysArray={daysArray}
              selectedDate={selectedDate}
              slideDirection={slideDirection}
              visibleMonth={visibleMonth}
              visibleYear={visibleYear}
              onSelectDate={selectDate}
            />
          </View>

          {/* Time Slot Grid Section (only rendered when date is selected) */}
          {selectedDate && (
            <TimeSlotGrid
              slots={slots}
              isLoading={isLoading}
              selectedTimeSlot={selectedTimeSlot}
              onSelectSlot={setSelectedTimeSlot}
            />
          )}

          {/* Urgent Booking Switch Row */}
          <UrgentToggleRow isUrgent={isUrgent} onToggle={setIsUrgent} />

          {/* Bottom spacing to ensure scroll clears sticky footer */}
          <View style={styles.footerSpacer} />
        </ScrollView>

        {/* Sticky Continue Footer */}
        <BookingFooterCTA
          label="Next: Address →"
          subtext={
            selectedDate && selectedTimeSlot
              ? `${selectedDate} • ${selectedTimeSlot}`
              : 'Select date & time slot'
          }
          enabled={Boolean(selectedDate && selectedTimeSlot)}
          onPress={handleContinue}
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
    paddingBottom: 20,
  },
  calendarCard: {
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray100,
    paddingBottom: 12,
    marginBottom: 8,
  },
  footerSpacer: {
    height: 100,
  },
});
