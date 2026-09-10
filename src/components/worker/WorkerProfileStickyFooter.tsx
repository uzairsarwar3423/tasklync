import React from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle } from 'react-native';
import { MessageCircle, Calendar, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily } from '../../design/typography';

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

  const handleChatPress = () => {
    onChat();
  };

  const handleBookPress = () => {
    onBookNow();
  };

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
      {/* Chat Pill Button */}
      <Pressable
        onPress={handleChatPress}
        style={({ pressed }) => [
          styles.chatButton,
          pressed && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Chat with worker"
      >
        <MessageCircle size={18} color="#16A34A" strokeWidth={2.2} />
        <Text style={styles.chatText}>Chat</Text>
      </Pressable>

      {/* Book Now Pill Button */}
      <Pressable
        onPress={handleBookPress}
        disabled={!isWorkerAvailable}
        style={({ pressed }) => [
          styles.bookButton,
          !isWorkerAvailable && styles.bookButtonDisabled,
          pressed && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Book Now"
      >
        <Calendar size={18} color="#FFFFFF" strokeWidth={2.2} />
        <Text style={styles.bookText}>Book Now</Text>
        <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} style={styles.arrowIcon} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  chatButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chatText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 15,
    color: '#16A34A',
  },
  bookButton: {
    flex: 1.8,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bookButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  bookText: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  arrowIcon: {
    marginLeft: 2,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
