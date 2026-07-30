import React, { useState, useEffect } from 'react';
import { StyleSheet, ViewStyle, Modal } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { WorkerPortfolioImage } from '../../types/review.types';
import { GestureLayer } from './GestureLayer';
import { PinchZoomView } from './PinchZoomView';
import { SwipeGallery } from './SwipeGallery';
import { ImageCounter } from './ImageCounter';
import { PortfolioCaption } from '../worker/PortfolioCaption';

interface ImageViewerProps {
  images: WorkerPortfolioImage[];
  initialIndex?: number;
  isVisible: boolean;
  onClose: () => void;
  style?: ViewStyle;
}

const springConfigGentle = { damping: 20, stiffness: 90 };

export const ImageViewer = ({
  images,
  initialIndex = 0,
  isVisible,
  onClose,
  style,
}: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const bgOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.7);

  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(initialIndex);
      bgOpacity.value = withTiming(1, { duration: 250 });
      contentScale.value = withSpring(1, springConfigGentle);
    } else {
      bgOpacity.value = 0;
      contentScale.value = 0.7;
      setIsZoomed(false);
    }
  }, [isVisible, initialIndex, bgOpacity, contentScale]);

  const handleClose = () => {
    bgOpacity.value = withTiming(0, { duration: 200 });
    contentScale.value = withSpring(0.7, { damping: 20, stiffness: 120 });
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleZoomChange = (scale: number) => {
    setIsZoomed(scale > 1.1);
  };

  const renderImage = (image: WorkerPortfolioImage, index: number) => {
    // Render optimization: only render current and adjacent images
    if (Math.abs(index - currentIndex) > 1) {
      return null;
    }

    return (
      <PinchZoomView onZoomChange={handleZoomChange}>
        <Image
          source={{ uri: image.imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          cachePolicy="memory-disk"
          priority={index === currentIndex ? 'high' : 'low'}
        />
      </PinchZoomView>
    );
  };

  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      opacity: bgOpacity.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: contentScale.value }],
    };
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <StatusBar hidden />
      <Animated.View style={[styles.background, animatedBgStyle]} />
      
      <Animated.View style={[styles.container, animatedContentStyle, style]}>
        <GestureLayer
          disabled={isZoomed}
          onSingleTap={handleClose}
          onSwipeDown={() => {
            if (!isZoomed) handleClose();
          }}
        >
          <SwipeGallery
            images={images}
            initialIndex={initialIndex}
            onIndexChange={setCurrentIndex}
            renderItem={renderImage}
          />
        </GestureLayer>
        
        <ImageCounter
          current={currentIndex + 1}
          total={images.length}
        />
        
        <PortfolioCaption
          caption={images[currentIndex]?.caption || null}
          imageIndex={currentIndex}
        />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
