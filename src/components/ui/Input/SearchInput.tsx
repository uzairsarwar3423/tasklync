import React, { useEffect } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { Search, X } from 'lucide-react-native';

import { TextInput, TextInputProps } from './TextInput';
import { springConfig } from '@design/animations';

export interface SearchInputProps extends Omit<TextInputProps, 'leftIcon' | 'rightIcon' | 'onRightIconPress'> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<RNTextInput, SearchInputProps>(({
  value,
  onChangeText,
  onClear,
  autoFocus,
  ...rest
}, ref) => {
  const isVisible = !!(value && value.length > 0);
  
  const scale = useSharedValue(isVisible ? 1 : 0.5);
  const opacity = useSharedValue(isVisible ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isVisible ? 1 : 0.5, springConfig.snappy);
    opacity.value = withTiming(isVisible ? 1 : 0, { duration: 150 });
  }, [isVisible, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };

  const ClearIcon = ({ size, color }: { size: number, color: string }) => {
    return (
      <Animated.View style={animatedStyle}>
        <X size={size} color={color} />
      </Animated.View>
    );
  };

  return (
    <TextInput
      ref={ref}
      value={value}
      onChangeText={onChangeText}
      leftIcon={Search}
      rightIcon={ClearIcon}
      {...(isVisible ? { onRightIconPress: handleClear } : {})}
      autoFocus={autoFocus}
      {...rest}
    />
  );
});
