import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

// Design system
import { palette } from '../../src/design';

// Success Subcomponents
import { SuccessCelebration } from '../../src/components/booking/success/SuccessCelebration';
import { SuccessHeadline } from '../../src/components/booking/success/SuccessHeadline';
import { SuccessSubtitle } from '../../src/components/booking/success/SuccessSubtitle';
import { NextStepsList } from '../../src/components/booking/success/NextStepsList';
import { SuccessCTAGroup } from '../../src/components/booking/success/SuccessCTAGroup';

export default function SuccessScreen() {
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = params.bookingId || `TL-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* 1. Ceremonial Checkmark & Pulse Wave */}
          <SuccessCelebration />

          {/* 2. Poppins Headline: "Booking Confirmed!" */}
          <SuccessHeadline title="Booking Confirmed!" />

          {/* 3. Subtitle & Booking ID (Inter) */}
          <SuccessSubtitle bookingId={bookingId} />

          {/* 4. Sequenced Next Steps List */}
          <NextStepsList />

          {/* 5. Final CTA Group: Track Booking + Back to Home */}
          <SuccessCTAGroup bookingId={bookingId} />
        </ScrollView>
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
    backgroundColor: palette.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },
});
