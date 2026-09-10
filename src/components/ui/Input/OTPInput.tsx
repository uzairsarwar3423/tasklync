import { useRef, useState, useEffect } from 'react';
import { 
  View, 
  TextInput as RNTextInput, 
  StyleSheet
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay
} from 'react-native-reanimated';

import { colors } from '@design/colors';
import { radius } from '@design/radius';
import { fontFamily } from '@design/typography';
import { shakeSequence, springConfig } from '@design/animations';

const AnimatedView = Animated.createAnimatedComponent(View);

export interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  length?: number;
}

export const OTPInput = ({
  value,
  onChange,
  onComplete,
  error = false,
  success = false,
  disabled = false,
  length = 6
}: OTPInputProps) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<Array<RNTextInput | null>>([]);
  
  // Shared values for animation
  const shakeX = useSharedValue(0);
  
  // We need an array of scale values for individual boxes
  const scales = Array.from({ length }).map(() => useSharedValue(1.0));
  
  // Handle auto-focus on mount
  useEffect(() => {
    if (!disabled) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [disabled]);

  // Handle Error Shake
  useEffect(() => {
    if (error) {
      shakeX.value = withSequence(
        ...shakeSequence.map(x => withTiming(x, { duration: 45 }))
      );
      
      // Auto clear after error
      setTimeout(() => {
        onChange('');
        inputRefs.current[0]?.focus();
      }, 600);
    }
  }, [error, shakeX, onChange]);

  // Handle Success Cascade Bounce
  useEffect(() => {
    if (success) {
      scales.forEach((scale, index) => {
        scale.value = withDelay(
          index * 40,
          withSequence(
            withSpring(1.08, springConfig.bouncy),
            withSpring(1.0, springConfig.bouncy)
          )
        );
      });
    }
  }, [success, scales]);

  const handleTextChange = (text: string, index: number) => {
    if (disabled) return;
    
    // Paste detection (if text length > 1)
    const sanitized = text.replace(/[^0-9]/g, '');
    if (sanitized.length > 1) {
      const extracted = sanitized.slice(0, length);
      onChange(extracted);
      
      if (extracted.length === length && onComplete) {
        onComplete(extracted);
        inputRefs.current[length - 1]?.blur();
      } else {
        inputRefs.current[extracted.length]?.focus();
      }
      return;
    }

    // Normal typing (1 char)
    if (sanitized.length === 1) {
      const newValue = value.split('');
      newValue[index] = sanitized;
      const newStr = newValue.join('');
      onChange(newStr);
      
      // Box scale bounce
      scales[index].value = withSequence(
        withSpring(1.06, springConfig.bouncy),
        withSpring(1.0, springConfig.bouncy)
      );

      // Advance
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (newStr.length === length && onComplete) {
        onComplete(newStr);
        inputRefs.current[index]?.blur();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (value[index]) {
        // Clear current box
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous box and clear it
        inputRefs.current[index - 1]?.focus();
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
      }
    }
  };

  return (
    <AnimatedView style={[styles.container, { transform: [{ translateX: shakeX }] }]}>
      {Array.from({ length }).map((_, index) => {
        const char = value[index] || '';
        const isFocused = focusedIndex === index;
        const isFilled = char.length > 0;
        
        let bgColor = colors.bgInput;
        let borderColor = 'transparent';
        
        if (error) {
          bgColor = colors.bgCard;
          borderColor = colors.borderError;
        } else if (success) {
          bgColor = colors.bgSuccess;
          borderColor = colors.borderSuccess;
        } else if (isFocused) {
          bgColor = colors.bgCard;
          borderColor = colors.borderFocus;
        } else if (isFilled) {
          bgColor = colors.bgCard;
          borderColor = colors.border;
        }

        const animatedBoxStyle = useAnimatedStyle(() => {
          // Continuous scale for focused but empty box
          const currentScale = isFocused && !isFilled && !error && !success 
            ? 1.06 
            : scales[index].value;
            
          return {
            transform: [{ scale: currentScale }]
          };
        });

        return (
          <AnimatedView 
            key={index} 
            style={[
              styles.boxContainer, 
              { backgroundColor: bgColor, borderColor, borderWidth: 2 },
              animatedBoxStyle
            ]}
          >
            <RNTextInput
              ref={(ref) => { inputRefs.current[index] = ref; }}
              value={char}
              onChangeText={text => handleTextChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={index === 0 ? length : 1} // allow paste in first box
              caretHidden={true}
              editable={!disabled}
              accessibilityLabel={`One-time password digit ${index + 1} of ${length}`}
              style={styles.input}
            />
          </AnimatedView>
        );
      })}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  boxContainer: {
    width: 50,
    height: 58,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontFamily: fontFamily.inter.bold,
    fontSize: 22,
    color: colors.textPrimary,
  }
});
