import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ViewStyle, useWindowDimensions, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';
import { WorkerPortfolioImage } from '../../types/review.types';
import { PortfolioCell } from './PortfolioCell';

import { colors } from '@design/colors';
import { fontFamily as fonts } from '@design/typography';

interface WorkerPortfolioGridProps {
  images: WorkerPortfolioImage[];
  workerId: string;
  maxVisible?: number;
  onViewAll?: () => void;
  onImagePress: (images: WorkerPortfolioImage[], startIndex: number) => void;
  showHeader?: boolean;
  style?: ViewStyle;
  onLayout?: (e: any) => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const WorkerPortfolioGrid = ({
  images,
  workerId,
  maxVisible = 6,
  onViewAll,
  onImagePress,
  showHeader = true,
  style,
  onLayout,
}: WorkerPortfolioGridProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const [hasAnimated, setHasAnimated] = useState(false);

  // Trigger animation simply on mount for this component or if triggered by scroll.
  // For simplicity, we trigger on mount or can be exposed as an animated prop.
  useEffect(() => {
    setHasAnimated(true);
  }, []);

  if (!images || images.length === 0) return null;

  const padding = 32; // 16px horizontal padding
  const gap = 4;
  const numColumns = 3;
  const totalGapWidth = gap * (numColumns - 1);
  const cellSize = Math.floor((screenWidth - padding - totalGapWidth) / numColumns);

  const visibleImages = images.slice(0, maxVisible);
  const remainingCount = images.length - maxVisible;

  const renderCell = (image: WorkerPortfolioImage, index: number) => {
    const isLastCell = index === maxVisible - 1 && remainingCount > 0;
    
    // Animation shared values for each cell
    const cellOpacity = useSharedValue(hasAnimated ? 1 : 0);
    const cellScale = useSharedValue(hasAnimated ? 1 : 0.92);

    useEffect(() => {
      if (hasAnimated) {
        cellOpacity.value = withDelay(index * 60, withSpring(1, { damping: 20, stiffness: 90 }));
        cellScale.value = withDelay(index * 60, withSpring(1, { damping: 20, stiffness: 90 }));
      }
    }, [hasAnimated, index, cellOpacity, cellScale]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: cellOpacity.value,
        transform: [{ scale: cellScale.value }],
      };
    });

    return (
      <AnimatedView key={image.id} style={animatedStyle}>
        <View style={isLastCell ? styles.lastCellContainer : undefined}>
          <PortfolioCell
            image={image}
            size={cellSize}
            index={index}
            onPress={() => (isLastCell && onViewAll ? onViewAll() : onImagePress(images, index))}
            priority={index < 3 ? 'high' : 'normal'}
          />
          {isLastCell && (
            <Pressable
              style={[styles.lastCellOverlay, { width: cellSize, height: cellSize }]}
              onPress={onViewAll}
            >
              <Text style={styles.remainingText}>+{remainingCount}</Text>
            </Pressable>
          )}
        </View>
      </AnimatedView>
    );
  };

  const gridContent = (
    <View style={[styles.grid, { gap }]} onLayout={onLayout}>
      {visibleImages.map((img, idx) => renderCell(img, idx))}
    </View>
  );

  if (showHeader) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Portfolio</Text>
          {onViewAll && remainingCount > 0 && (
            <Pressable onPress={onViewAll} hitSlop={12}>
              <Text style={styles.viewAllText}>View all {images.length} photos →</Text>
            </Pressable>
          )}
        </View>
        {gridContent}
      </View>
    );
  }

  return <View style={[styles.container, style]}>{gridContent}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: fonts.poppins.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  viewAllText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  lastCellContainer: {
    position: 'relative',
  },
  lastCellOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6, // radius.sm
  },
  remainingText: {
    fontFamily: fonts.inter.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
});
