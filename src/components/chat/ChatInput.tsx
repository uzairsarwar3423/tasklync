import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Paperclip, ArrowUp } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatInputProps {
  onSend: (text: string, type?: 'text' | 'image', mediaUrl?: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ChatInput = React.memo(function ChatInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState<string>('');
  const [inputHeight, setInputHeight] = useState<number>(40);
  const insets = useSafeAreaInsets();

  // Send button animation progress (0: empty/disabled, 1: has text/active)
  const sendProgress = useSharedValue(0);

  const handleChangeText = (val: string) => {
    setText(val);
    if (val.trim().length > 0) {
      sendProgress.value = withTiming(1, { duration: 150 });
      onTyping?.();
    } else {
      sendProgress.value = withTiming(0, { duration: 150 });
      onStopTyping?.();
    }
  };

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) return;
    const toSend = text;
    setText('');
    sendProgress.value = withTiming(0, { duration: 150 });
    onStopTyping?.();
    onSend(toSend, 'text');
  }, [text, disabled, onSend, onStopTyping, sendProgress]);

  // Image Attachment Picker
  const pickImageFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please enable camera access in settings.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onSend('', 'image', result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please enable photo library access in settings.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onSend('', 'image', result.assets[0].uri);
    }
  };

  const handleAttachPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImageFromCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      Alert.alert('Attach Photo', 'Select an option to send photo', [
        { text: 'Camera', onPress: pickImageFromCamera },
        { text: 'Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // Reanimated style for Send Button (Color transition using withTiming 150ms)
  const sendButtonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      sendProgress.value,
      [0, 1],
      ['#F3F4F6', '#16A34A']
    );

    return {
      backgroundColor,
    };
  });

  const sendIconColor = text.trim().length > 0 ? '#FFFFFF' : '#9CA3AF';

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.container}>
        {/* Attachment Button (44px hitSlop) */}
        <Pressable
          style={({ pressed }) => [styles.attachButton, pressed && styles.buttonPressed]}
          onPress={handleAttachPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Attach photo"
          accessibilityRole="button"
          disabled={disabled}
        >
          <Paperclip size={22} color="#6B7280" />
        </Pressable>

        {/* Input Text Box (grows 40px to 100px max) */}
        <TextInput
          style={[styles.input, { height: Math.min(Math.max(40, inputHeight), 100) }]}
          placeholder="Message..."
          placeholderTextColor="#9CA3AF"
          value={text}
          onChangeText={handleChangeText}
          multiline
          maxLength={1000}
          onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
          editable={!disabled}
        />

        {/* Send Button (44px touch target) */}
        <AnimatedPressable
          style={[styles.sendButton, sendButtonStyle]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          <ArrowUp size={18} color={sendIconColor} strokeWidth={2.5} />
        </AnimatedPressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  attachButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    marginBottom: 1,
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: '#111827',
    paddingTop: Platform.OS === 'ios' ? 9 : 8,
    paddingBottom: Platform.OS === 'ios' ? 9 : 8,
    paddingHorizontal: 8,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    marginLeft: 4,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
