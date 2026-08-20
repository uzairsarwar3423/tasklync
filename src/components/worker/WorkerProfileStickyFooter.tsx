import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { Button } from '../ui/Button/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../design/colors';

interface WorkerProfileStickyFooterProps {
  workerId: string;
  workerName: string;
  onChat: () => void;
  onBookNow: () => void;
  isWorkerAvailable: boolean;
  style?: ViewStyle;
}

export const WorkerProfileStickyFooter: React.FC<WorkerProfileStickyFooterProps> = ({
  onChat,
  onBookNow,
  isWorkerAvailable,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 14),
        },
        style,
      ]}
    >
      <Button
        variant="secondary"
        size="lg"
        label="Chat"
        icon={MessageCircle}
        onPress={onChat}
        fullWidth={false}
        haptic="light"
        style={styles.chatButton}
      />
      <Button
        variant="primary"
        size="lg"
        label="Book Now"
        onPress={onBookNow}
        disabled={!isWorkerAvailable}
        fullWidth={false}
        haptic="medium"
        style={styles.bookButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgCard || '#FFFFFF',
    borderTopWidth: 1.5,
    borderColor: colors.border || '#F3F4F6',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
  chatButton: {
    flex: 1,
  },
  bookButton: {
    flex: 1.5,
  },
});
