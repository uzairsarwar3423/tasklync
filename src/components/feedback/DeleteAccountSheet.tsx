import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { X, HeartHandshake } from 'lucide-react-native';
import { DeleteAccountReason } from '../../types/moderation.types';
import { DeleteAccountReasonStep } from './DeleteAccountReasonStep';
import { DeleteAccountConfirmStep } from './DeleteAccountConfirmStep';
import { colors, palette, fontFamily, fontSize, radius, spacing, shadows } from '../../design';

export interface DeleteAccountSheetProps {
  visible: boolean;
  onClose: () => void;
  onDeleteAccount: (reason?: DeleteAccountReason) => Promise<void>;
  isLoading?: boolean;
}

export const DeleteAccountSheet: React.FC<DeleteAccountSheetProps> = ({
  visible,
  onClose,
  onDeleteAccount,
  isLoading = false,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [chosenReason, setChosenReason] = useState<DeleteAccountReason | undefined>(undefined);
  const [isDeletedSuccess, setIsDeletedSuccess] = useState<boolean>(false);

  const resetAndClose = () => {
    if (isLoading || isDeletedSuccess) return;
    setStep(1);
    setChosenReason(undefined);
    onClose();
  };

  const handleReasonContinue = (reason?: DeleteAccountReason) => {
    setChosenReason(reason);
    setStep(2);
  };

  const handleConfirmDelete = async () => {
    await onDeleteAccount(chosenReason);
    setIsDeletedSuccess(true);
  };

  if (!visible) return null;

  // Peak-End Rule: Calm, respectful goodbye screen before automatic redirect
  if (isDeletedSuccess) {
    return (
      <Modal visible={true} transparent={false} animationType="fade">
        <View
          style={styles.goodbyeContainer}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <View style={styles.goodbyeIconBox}>
            <HeartHandshake size={36} color={palette.gray700} />
          </View>
          <Text style={styles.goodbyeTitle} maxFontSizeMultiplier={1.3}>
            Account Deleted
          </Text>
          <Text style={styles.goodbyeSubtitle} maxFontSizeMultiplier={1.3}>
            Your account has been deleted. We're sorry to see you go and thank you for being a part of Tasklync.
          </Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={resetAndClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={resetAndClose}
        />

        <View style={styles.sheetContainer}>
          {/* Drag Handle */}
          <View style={styles.handle} />

          {/* Close button */}
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={resetAndClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close account deletion sheet"
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {step === 1 ? (
              <DeleteAccountReasonStep
                onContinue={handleReasonContinue}
                onSkip={() => setStep(2)}
              />
            ) : (
              <DeleteAccountConfirmStep
                onConfirmDelete={handleConfirmDelete}
                onBack={() => setStep(1)}
                isLoading={isLoading}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheetContainer: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingBottom: Platform.OS === 'ios' ? 36 : spacing.lg,
    maxHeight: '85%',
    ...shadows.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.gray300,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.xs,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.base,
  },
  goodbyeContainer: {
    flex: 1,
    backgroundColor: colors.bgApp,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  goodbyeIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.iceGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  goodbyeTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  goodbyeSubtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.body1,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
