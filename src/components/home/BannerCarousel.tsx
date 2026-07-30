import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { shadows } from '../../design/shadows';

const { width: screenWidth } = Dimensions.get('window');
const BANNER_WIDTH = screenWidth - 32;

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string | null;
  ctaAction: () => void | null;
  gradient: [string, string];
}

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: '100% Satisfaction Guarantee',
    subtitle: 'Not happy? Get a full refund, no questions asked.',
    gradient: ['#16A34A', '#15803D'],
    ctaLabel: 'Learn more',
    ctaAction: () => {},
  },
  {
    id: 'b2',
    title: 'Refer a Friend',
    subtitle: 'Share Tasklync, both get Rs 200 off next booking.',
    gradient: ['#0EA5E9', '#0284C7'],
    ctaLabel: 'Invite friends',
    ctaAction: () => {},
  },
];

export const BannerCarousel = () => {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      let nextIndex = indexRef.current + 1;
      if (nextIndex >= DEFAULT_BANNERS.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      indexRef.current = nextIndex;
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
    indexRef.current = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
  };

  const onTouchStart = () => setIsAutoPlay(false);
  const onTouchEnd = () => setIsAutoPlay(true);

  const renderBanner = ({ item }: { item: Banner }) => {
    return (
      <View style={styles.bannerWrapper}>
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <View style={styles.content}>
            <View>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
            </View>
            
            {item.ctaLabel && (
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>{item.ctaLabel}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={DEFAULT_BANNERS}
        renderItem={renderBanner}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 100);
        }}
      />
      
      <View style={styles.dotsContainer}>
        {DEFAULT_BANNERS.map((_, i) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const width = interpolate(
              scrollX.value,
              [(i - 1) * BANNER_WIDTH, i * BANNER_WIDTH, (i + 1) * BANNER_WIDTH],
              [6, 20, 6],
              Extrapolation.CLAMP
            );
            const opacity = interpolate(
              scrollX.value,
              [(i - 1) * BANNER_WIDTH, i * BANNER_WIDTH, (i + 1) * BANNER_WIDTH],
              [0.3, 1, 0.3],
              Extrapolation.CLAMP
            );
            return {
              width,
              opacity,
            };
          });

          return (
            <Animated.View key={`dot-${i}`} style={[styles.dot, animatedDotStyle]} />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  bannerWrapper: {
    width: BANNER_WIDTH,
    height: 140,
    marginHorizontal: 16,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  banner: {
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 32,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  ctaText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
