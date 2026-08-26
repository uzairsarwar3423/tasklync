import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { colors, palette, fontFamily, fontSize, radius, spacing, shadows } from '../../design';
import * as Haptics from 'expo-haptics';

export interface UnblockConfirmPopoverProps {
  visible: boolean;
  workerName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UnblockConfirmPopover: React.FC<UnblockConfirmPopoverProps> = ({
  visible,
  workerName,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onCancel();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <Text style={styles.title} maxFontSizeMultiplier={1.3}>
            Unblock {workerName}?
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.3}>
            They will appear in your search results and can receive your future booking requests.
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCancel}
              style={styles.cancelBtn}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Cancel unblocking"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleConfirm}
              style={styles.unblockBtn}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={`Confirm unblocking ${workerName}`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={palette.white} />
              ) : (
                <Text style={styles.unblockText}>Unblock</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  title: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.body1 + 1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: fontSize.caption + 0.5,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelBtn: {
    height: 38,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: palette.gray100,
  },
  cancelText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  unblockBtn: {
    height: 38,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: palette.green600,
  },
  unblockText: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 13,
    color: palette.white,
  },
});
