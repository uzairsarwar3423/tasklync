import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { WorkerPortfolioImage } from '../../types/review.types';

interface SwipeGalleryProps {
  images: WorkerPortfolioImage[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onDismiss?: () => void;
  renderItem: (image: WorkerPortfolioImage, index: number) => React.ReactNode;
  style?: ViewStyle;
}

const springConfigGentle = { damping: 20, stiffness: 90 };
const springConfigBouncy = { damping: 15, stiffness: 120 };

export const SwipeGallery = ({
  images,
  initialIndex = 0,
  onIndexChange,
  onDismiss,
  renderItem,
  style,
}: SwipeGalleryProps) => {
  const { width } = useWindowDimensions();
  const currentIndex = useSharedValue(initialIndex);
  const translateX = useSharedValue(-initialIndex * width);
  const dragX = useSharedValue(0);

  useEffect(() => {
    currentIndex.value = initialIndex;
    translateX.value = -initialIndex * width;
  }, [initialIndex, width, currentIndex, translateX]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      dragX.value = e.translationX;
      let newTranslateX = -currentIndex.value * width + dragX.value;

      // Resistance at edges
      if (currentIndex.value === 0 && newTranslateX > 0) {
        newTranslateX = newTranslateX * 0.3; // Elastic resistance left
      } else if (
        currentIndex.value === images.length - 1 &&
        newTranslateX < -(images.length - 1) * width
      ) {
        const overscroll = newTranslateX + (images.length - 1) * width;
        newTranslateX = -(images.length - 1) * width + overscroll * 0.3; // Elastic resistance right
      }
      
      translateX.value = newTranslateX;
    })
    .onEnd((e) => {
      const { translationX, velocityX, translationY } = e;
      dragX.value = 0;

      // Vertical swipe to dismiss logic
      if (Math.abs(translationY) > 100 && Math.abs(translationY) > Math.abs(translationX)) {
        if (onDismiss) runOnJS(onDismiss)();
        translateX.value = withSpring(-currentIndex.value * width, springConfigBouncy);
        return;
      }

      // Horizontal swipe logic
      let nextIndex = currentIndex.value;

      if (translationX < -width / 3 || velocityX < -400) {
        nextIndex = Math.min(currentIndex.value + 1, images.length - 1);
      } else if (translationX > width / 3 || velocityX > 400) {
        nextIndex = Math.max(currentIndex.value - 1, 0);
      }

      if (nextIndex !== currentIndex.value) {
        currentIndex.value = nextIndex;
        if (onIndexChange) runOnJS(onIndexChange)(nextIndex);
        translateX.value = withSpring(-nextIndex * width, springConfigGentle);
      } else {
        translateX.value = withSpring(-currentIndex.value * width, springConfigBouncy);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, { width: images.length * width }, animatedStyle, style]}>
        {images.map((img, index) => (
          <Animated.View key={img.id} style={[styles.itemContainer, { width, height: '100%' }]}>
            {renderItem(img, index)}
          </Animated.View>
        ))}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
