import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily as fonts } from '@design/typography';
import { radius } from '@design/radius';

interface ImageCounterProps {
  current: number; // 1-based display
  total: number;
  style?: ViewStyle;
}

export const ImageCounter = ({ current, total, style }: ImageCounterProps) => {
  const insets = useSafeAreaInsets();
  const [displayCurrent, setDisplayCurrent] = useState(current);

  const opacityOld = useSharedValue(1);
  const translateYOld = useSharedValue(0);
  const opacityNew = useSharedValue(0);
  const translateYNew = useSharedValue(8);

  useEffect(() => {
    if (current !== displayCurrent) {
      // Animate old out
      opacityOld.value = withTiming(0, { duration: 100 });
      translateYOld.value = withTiming(-8, { duration: 100 });

      // After a tiny delay, swap text and animate new in
      setTimeout(() => {
        setDisplayCurrent(current);
        opacityOld.value = 1;
        translateYOld.value = 0;
        
        opacityNew.value = 0;
        translateYNew.value = 8;
        
        opacityNew.value = withTiming(1, { duration: 100 });
        translateYNew.value = withTiming(0, { duration: 100 });
      }, 100);
    }
  }, [current, displayCurrent, opacityOld, translateYOld, opacityNew, translateYNew]);

  const animatedStyleOld = useAnimatedStyle(() => {
    return {
      opacity: opacityOld.value,
      transform: [{ translateY: translateYOld.value }],
    };
  });

  const animatedStyleNew = useAnimatedStyle(() => {
    return {
      opacity: opacityNew.value,
      transform: [{ translateY: translateYNew.value }],
      position: 'absolute',
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 12 },
        style,
      ]}
      accessible={true}
      accessibilityLabel={`Photo ${current} of ${total}`}
      accessibilityLiveRegion="polite"
    >
      <Animated.Text style={[styles.text, animatedStyleOld]}>
        {displayCurrent} / {total}
      </Animated.Text>
      <Animated.Text style={[styles.text, animatedStyleNew]}>
        {current} / {total}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  text: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
