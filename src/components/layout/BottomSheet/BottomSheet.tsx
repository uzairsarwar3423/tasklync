import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetHandle } from './BottomSheetHandle';
import { colors } from '../../../design/colors';

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
  snapTo: (index: number) => void;
}

interface BottomSheetProps {
  snapPoints?: string[]; // Kept for API compatibility
  defaultSnapIndex?: number;
  onClose?: () => void;
  closeOnBackdropPress?: boolean;
  enablePanDownToClose?: boolean;
  children: React.ReactNode;
  contentPadding?: boolean;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      onClose,
      closeOnBackdropPress = true,
      children,
      contentPadding = true,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const handleClose = () => {
      setIsVisible(false);
      if (onClose) onClose();
    };

    useImperativeHandle(ref, () => ({
      open: () => setIsVisible(true),
      close: handleClose,
      snapTo: () => {}, 
    }));

    return (
      <Modal 
        visible={isVisible} 
        transparent={true}
        animationType="slide" // Native OS smooth slide animation
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          {/* Fully transparent backdrop, no gray dimming */}
          <Pressable
            style={styles.backdrop}
            onPress={closeOnBackdropPress ? handleClose : undefined}
          />

          <View style={styles.sheetContainer}>
            <BottomSheetHandle />
            <View
              style={[
                styles.contentContainer,
                contentPadding && styles.withPadding,
                { paddingBottom: Math.max(insets.bottom, 24) },
              ]}
            >
              {children}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheetContainer: {
    flexShrink: 1,
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%', 
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  contentContainer: {
    flexShrink: 1,
  },
  withPadding: {
    paddingHorizontal: 16,
  },
});
