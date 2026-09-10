import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  XCircle,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  User,
  MessageSquare,
  FileText,
} from 'lucide-react-native';
import { palette, colors } from '../../src/design';
import { useBookingDetails } from '../../src/hooks/useBookingDetails';
import { useBookingTrack } from '../../src/hooks/useBookingTrack';
import { useConfirmCompletion } from '../../src/hooks/useConfirmCompletion';
import { useBookingDispute } from '../../src/hooks/useBookingDispute';
import { BookingCancelModal } from '../../src/components/booking/BookingCancelModal';
import { ErrorState } from '../../src/components/feedback/ErrorState';
import { BookingStatus } from '../../src/types/booking.types';

const STATUS_STEPS: BookingStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED_BY_WORKER', 'COMPLETED'];

const STEP_LABELS: Record<string, string> = {
  PENDING: 'Booking Placed',
  ACCEPTED: 'Worker Accepted',
  IN_PROGRESS: 'Work In Progress',
  COMPLETED_BY_WORKER: 'Worker Marked Complete',
  COMPLETED: 'Confirmed & Completed',
};

export default function BookingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch full details and live tracking
  const { booking, isLoading, error, refetch } = useBookingDetails(id);
  const { trackData } = useBookingTrack(id, Boolean(booking));

  // Mutations
  const { confirmCompletion, isLoading: isConfirming } = useConfirmCompletion();
  const { dispute, openDispute, isSubmittingDispute } = useBookingDispute(id);

  // Modals state
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={palette.zenWhite} />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Go back">
              <ArrowLeft size={22} color={palette.gray900} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Booking Details</Text>
            </View>
          </View>
          <ErrorState
            type="error"
            title="Booking details unavailable"
            subtitle={error?.message || "We couldn't load the details for this booking. Please check your internet connection or try again."}
            onRetry={refetch}
            retryButtonText="Retry"
            style={{ flex: 1, justifyContent: 'center' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentStatus: BookingStatus = trackData?.status || booking.status;

  // Handle Completion Confirmation
  const handleConfirmJob = async () => {
    Alert.alert(
      'Confirm Completion',
      'Are you sure the service was completed to your satisfaction? This will release payment to the worker.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Release Funds',
          onPress: async () => {
            try {
              await confirmCompletion(booking.id);
              Alert.alert('Completed', 'Thank you! Job completed and payment released.');
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to confirm completion.');
            }
          },
        },
      ]
    );
  };

  // Handle Dispute Submission
  const handleOpenDispute = async () => {
    if (disputeReason.trim().length < 10) {
      Alert.alert('Details Required', 'Please provide a detailed dispute reason (at least 10 characters).');
      return;
    }
    try {
      const urls = evidenceUrl.trim() ? [evidenceUrl.trim()] : undefined;
      await openDispute({ id: booking.id, reason: disputeReason, evidenceUrls: urls });
      setDisputeModalVisible(false);
      setDisputeReason('');
      setEvidenceUrl('');
      Alert.alert('Dispute Opened', 'Your dispute has been logged. Our support team will review it within 24 hours.');
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to open dispute.');
    }
  };

  const getStepIndex = (status: BookingStatus) => {
    return STATUS_STEPS.indexOf(status);
  };

  const currentStepIdx = getStepIndex(currentStatus);
  const isTerminal = ['CANCELLED', 'REJECTED', 'DISPUTED', 'RESOLVED', 'REFUNDED'].includes(currentStatus);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.zenWhite} />
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={palette.gray900} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Booking Specs & Track</Text>
            <Text style={styles.bookingIdText}>ID: {booking.id.substring(0, 18)}...</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Timeline / Banner */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Live Job Progress</Text>
            {isTerminal ? (
              <View style={styles.terminalBanner}>
                {currentStatus === 'CANCELLED' ? (
                  <XCircle size={28} color={palette.gray600} />
                ) : (
                  <AlertTriangle size={28} color="#EA580C" />
                )}
                <View style={styles.terminalBannerText}>
                  <Text style={styles.terminalBannerTitle}>Status: {currentStatus}</Text>
                  {booking.cancellation_reason && (
                    <Text style={styles.terminalBannerSub}>Reason: {booking.cancellation_reason}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.timelineContainer}>
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <View key={step} style={styles.timelineRow}>
                      <View style={styles.timelineIconCol}>
                        <View
                          style={[
                            styles.dot,
                            isDone && styles.dotDone,
                            isCurrent && styles.dotCurrent,
                          ]}
                        >
                          {isDone && <Check size={12} color={palette.white} strokeWidth={3} />}
                        </View>
                        {idx < STATUS_STEPS.length - 1 && (
                          <View style={[styles.line, isDone && styles.lineDone]} />
                        )}
                      </View>
                      <View style={styles.timelineTextCol}>
                        <Text
                          style={[
                            styles.stepTitle,
                            isDone && styles.stepTitleDone,
                            isCurrent && styles.stepTitleCurrent,
                          ]}
                        >
                          {STEP_LABELS[step]}
                        </Text>
                        {isCurrent && (
                          <Text style={styles.stepSubtitle}>Active Step • Live Polling</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Worker Identity Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assigned Professional</Text>
            <View style={styles.workerRow}>
              {booking.worker_avatar_url ? (
                <Image source={{ uri: booking.worker_avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={24} color={palette.gray500} />
                </View>
              )}
              <View style={styles.workerDetails}>
                <Text style={styles.workerName}>{booking.worker_name || 'Assigned Professional'}</Text>
                <Text style={styles.categorySub}>{booking.category_name || 'Service Professional'}</Text>
              </View>
              <View style={styles.workerActions}>
                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() =>
                    router.push({
                      pathname: `/booking/${booking.id}/chat`,
                      params: {
                        workerName: booking.worker_name,
                        workerAvatar: booking.worker_avatar_url,
                        workerPhone: booking.worker_phone || trackData?.worker_phone,
                        categoryName: booking.category_name,
                        workerId: booking.worker_id,
                      },
                    } as any)
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MessageSquare size={18} color={palette.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => {
                    const phone = trackData?.worker_phone || (booking as any).worker_phone;
                    if (phone) {
                      Alert.alert('Contact Worker', `Call ${booking.worker_name || 'Worker'} at ${phone}?`);
                    } else {
                      router.push({
                        pathname: `/booking/${booking.id}/chat`,
                        params: {
                          workerName: booking.worker_name,
                          workerAvatar: booking.worker_avatar_url,
                          workerPhone: phone,
                          categoryName: booking.category_name,
                          workerId: booking.worker_id,
                        },
                      } as any);
                    }
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Phone size={18} color={palette.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Job Site Location */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Job Site Location</Text>
            <View style={styles.locationRow}>
              <MapPin size={20} color={colors.primaryDark} />
              <Text style={styles.locationText}>{booking.address_text}</Text>
            </View>
            {booking.job_site_location && (
              <Text style={styles.coordsText}>
                GPS: {booking.job_site_location.lat.toFixed(4)}, {booking.job_site_location.lng.toFixed(4)}
              </Text>
            )}
          </View>

          {/* Price Breakdown Engine (Section 4 Spec) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pricing Engine Breakdown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base Rate</Text>
              <Text style={styles.priceVal}>Rs. {booking.base_price.toLocaleString()}</Text>
            </View>

            {booking.urgency_multiplier > 1.0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Urgency Surge ({booking.urgency_multiplier}x)</Text>
                <Text style={styles.priceVal}>
                  +Rs. {(booking.base_price * (booking.urgency_multiplier - 1)).toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Platform Commission (15%)</Text>
              <Text style={styles.priceVal}>Rs. {booking.platform_fee.toLocaleString()}</Text>
            </View>

            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Text style={styles.totalVal}>Rs. {booking.estimated_total.toLocaleString()}</Text>
            </View>

            <Text style={styles.payoutNote}>
              Escrow Protected • Worker Net Payout: Rs. {booking.worker_amount.toLocaleString()}
            </Text>
          </View>

          {/* Dispute Info Section (if dispute exists) */}
          {(currentStatus === 'DISPUTED' || dispute) && (
            <View style={[styles.card, { borderColor: '#F97316' }]}>
              <Text style={[styles.cardTitle, { color: '#EA580C' }]}>Dispute Information</Text>
              <Text style={styles.disputeText}>
                Status: <Text style={{ fontWeight: '700' }}>{dispute?.status || 'OPEN'}</Text>
              </Text>
              <Text style={styles.disputeText}>
                Reason: {dispute?.reason || 'Service quality dispute filed.'}
              </Text>
              {dispute?.worker_response && (
                <Text style={styles.disputeResponse}>
                  Worker Response: {dispute.worker_response}
                </Text>
              )}
            </View>
          )}

          {/* Dynamic Actions based on State Machine (Section 3 Spec) */}
          <View style={styles.actionsSection}>
            {/* Invoice & Receipt Button (Available for completed or in-progress bookings) */}
            {(currentStatus === 'COMPLETED' || currentStatus === 'AUTO_COMPLETED' || currentStatus === 'RESOLVED') && (
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.primaryDark, marginBottom: 12 }]}
                onPress={() => router.push(`/booking/${booking.id}/invoice` as any)}
              >
                <FileText size={20} color={palette.white} />
                <Text style={styles.confirmBtnText}>View Official Invoice & Receipt</Text>
              </TouchableOpacity>
            )}

            {/* Cancel Button (valid during PENDING or ACCEPTED) */}
            {(currentStatus === 'PENDING' || currentStatus === 'ACCEPTED') && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCancelModalVisible(true)}
              >
                <XCircle size={20} color="#DC2626" />
                <Text style={styles.cancelBtnText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}

            {/* Confirm Completion Button (valid when COMPLETED_BY_WORKER) */}
            {currentStatus === 'COMPLETED_BY_WORKER' && (
              <>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmJob}
                  disabled={isConfirming}
                >
                  <CheckCircle2 size={20} color={palette.white} />
                  <Text style={styles.confirmBtnText}>
                    {isConfirming ? 'Processing...' : 'Confirm Job & Release Funds'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.disputeBtn}
                  onPress={() => router.push(`/booking/${booking.id}/dispute` as any)}
                >
                  <AlertCircle size={20} color="#EA580C" />
                  <Text style={styles.disputeBtnText}>Report Issue / Open Dispute</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {/* Modal 1: Cancel Booking Modal with Dynamic Refund Policy */}
        <BookingCancelModal
          visible={cancelModalVisible}
          booking={booking}
          onClose={() => setCancelModalVisible(false)}
          onCancelled={() => {
            setCancelModalVisible(false);
            refetch();
          }}
        />

        {/* Modal 2: Dispute Booking Modal */}
        <Modal visible={disputeModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Open Dispute</Text>
              <Text style={styles.modalSubtitle}>
                Explain what went wrong with your booking. Provide evidence URLs if available.
              </Text>

              <TextInput
                style={styles.textInput}
                placeholder="Detailed reason for dispute (min 10 chars)..."
                value={disputeReason}
                onChangeText={setDisputeReason}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.textInput, { marginTop: 10 }]}
                placeholder="Evidence URL (e.g. Cloudinary image link)..."
                value={evidenceUrl}
                onChangeText={setEvidenceUrl}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setDisputeModalVisible(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#EA580C' }]}
                  onPress={handleOpenDispute}
                  disabled={isSubmittingDispute}
                >
                  <Text style={styles.modalSubmitBtnText}>Submit Dispute</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray200,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.gray900,
  },
  bookingIdText: {
    fontSize: 12,
    color: palette.gray500,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.gray900,
    marginBottom: 12,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: colors.primary,
  },
  dotCurrent: {
    backgroundColor: palette.info,
    borderWidth: 3,
    borderColor: palette.infoLight,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: palette.gray200,
    marginVertical: 4,
  },
  lineDone: {
    backgroundColor: colors.primary,
  },
  timelineTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.gray500,
  },
  stepTitleDone: {
    color: palette.gray900,
  },
  stepTitleCurrent: {
    color: palette.infoDark,
    fontWeight: '800',
  },
  stepSubtitle: {
    fontSize: 11,
    color: palette.info,
    marginTop: 2,
  },
  terminalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.gray100,
    padding: 12,
    borderRadius: 12,
  },
  terminalBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  terminalBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.gray900,
  },
  terminalBannerSub: {
    fontSize: 12,
    color: palette.gray600,
    marginTop: 2,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.gray900,
  },
  categorySub: {
    fontSize: 12,
    color: palette.gray500,
    marginTop: 2,
  },
  workerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 13,
    color: palette.gray800,
    flex: 1,
  },
  coordsText: {
    fontSize: 11,
    color: palette.gray500,
    marginTop: 6,
    fontFamily: 'monospace',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: palette.gray600,
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.gray900,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: palette.gray200,
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.gray900,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  payoutNote: {
    fontSize: 11,
    color: palette.gray500,
    fontStyle: 'italic',
    marginTop: 8,
  },
  disputeText: {
    fontSize: 13,
    color: palette.gray800,
    marginBottom: 4,
  },
  disputeResponse: {
    fontSize: 12,
    color: palette.gray600,
    marginTop: 6,
    fontStyle: 'italic',
  },
  actionsSection: {
    marginBottom: 32,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  confirmBtnText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
  disputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFEDD5',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  disputeBtnText: {
    color: '#C2410C',
    fontSize: 14,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: palette.gray600,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.gray900,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: palette.gray600,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: palette.gray100,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: palette.gray900,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelBtnText: {
    color: palette.gray600,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalSubmitBtnText: {
    color: palette.white,
    fontWeight: '700',
  },
});
