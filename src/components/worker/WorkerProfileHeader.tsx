import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Download, Ellipsis, Star, ShieldCheck, Check } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, palette } from '../../design/colors';
import { fontFamily } from '../../design/typography';
import { WorkerPublicProfile } from '../../types/worker.types';

interface WorkerProfileHeaderProps {
  worker?: WorkerPublicProfile;
  scrollY?: SharedValue<number>;
  onBack: () => void;
  onShare: () => void;
  onMore: () => void;
}

export const WorkerProfileHeader: React.FC<WorkerProfileHeaderProps> = ({
  worker,
  scrollY,
  onBack,
  onShare,
  onMore,
}) => {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    onBack();
  };

  const handleShare = () => {
    onShare();
  };

  const handleMore = () => {
    onMore();
  };

  const getPrimaryCategory = () => {
    const firstCat = worker?.categories?.[0];
    if (typeof firstCat === 'string' && firstCat.trim()) return firstCat;
    if (firstCat && typeof firstCat === 'object') {
      return (firstCat as any).categoryName || (firstCat as any).name || 'Specialist';
    }
    const firstSkill = worker?.skills?.[0];
    if (firstSkill && typeof firstSkill === 'object') {
      return firstSkill.categoryName || 'Specialist';
    }
    return 'Specialist';
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'W';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const reviewCount = worker?.totalReviews ?? 0;
  const hasRealRating = typeof worker?.avgRating === 'number' && worker.avgRating > 0 && reviewCount > 0;
  const locationSubtitle = worker?.city
    ? `${getPrimaryCategory()} · ${worker.city}`
    : worker?.distanceLabel
    ? `${getPrimaryCategory()} · ${worker.distanceLabel}`
    : getPrimaryCategory();

  const safeTop = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
  );
  const safeTopPadding = Math.max(safeTop, 16) + 12;

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return { opacity: 1 };
    }
    // Remove gradient smoothly when scrolling: fully visible at scrollY = 0, completely gone by scrollY = 60
    const opacity = interpolate(
      scrollY.value,
      [0, 60],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      {/* Top Subtle Green Ambient Glow behind photo & navigation — fades out when scrolled */}
      <Animated.View
        style={[StyleSheet.absoluteFill, gradientAnimatedStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            '#DCFCE7', // soft luminous mint green
            '#F0FDF4', // delicate fade around photo
            '#FFFFFF', // fades smoothly to white
          ]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* 1. Top Floating Navigation Bar */}
      <View style={styles.navBar}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.navButton, pressed && styles.buttonPressed]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color={colors.textPrimary || '#0F172A'} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.navRightGroup}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.navButton, pressed && styles.buttonPressed]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Save or download profile"
          >
            <Download size={18} color={colors.textPrimary || '#0F172A'} strokeWidth={2.2} />
          </Pressable>

          <Pressable
            onPress={handleMore}
            style={({ pressed }) => [styles.navButton, pressed && styles.buttonPressed]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Ellipsis size={18} color={colors.textPrimary || '#0F172A'} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      {/* 2. Horizontal Worker Header: [Photo] [Information Stack] */}
      <View style={styles.workerRow}>
        {/* Left: Large Circular Photo */}
        <View style={styles.avatarWrapper}>
          {worker?.avatarUrl ? (
            <Image
              source={{ uri: worker.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>
                {getInitials(worker?.name)}
              </Text>
            </View>
          )}

          {/* Verification check badge overlapping bottom-right of photo */}
          {worker?.isVerified && (
            <View style={styles.photoVerifyBadge}>
              <Check size={12} color="#FFFFFF" strokeWidth={3} />
            </View>
          )}
        </View>

        {/* Right: Worker Information Stack */}
        <View style={styles.infoCol}>
          {/* Trust Pill */}
          {worker?.isVerified && (
            <View style={styles.verifiedPill}>
              <ShieldCheck size={12} color="#16A34A" strokeWidth={2.5} />
              <Text style={styles.verifiedPillText}>Verified Worker</Text>
            </View>
          )}

          {/* Worker Name */}
          <Text style={styles.nameText} numberOfLines={1}>
            {worker?.name || 'Worker'}
          </Text>

          {/* Profession · Location */}
          <Text style={styles.professionText} numberOfLines={1}>
            {locationSubtitle}
          </Text>

          {/* Rating & Reviews */}
          <View style={styles.ratingRow}>
            {hasRealRating ? (
              <>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{worker?.avgRating?.toFixed(1)}</Text>
                <Text style={styles.reviewCountText}>
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </Text>
              </>
            ) : (
              <Text style={styles.reviewCountText}>No reviews yet</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  avatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: palette.green100,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 26,
    color: colors.primaryDark,
  },
  photoVerifyBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    marginBottom: 4,
    gap: 4,
  },
  verifiedPillText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 11.5,
    color: '#16A34A',
  },
  nameText: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 22,
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  professionText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 13.5,
    color: '#64748B',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 14,
    color: '#0F172A',
  },
  reviewCountText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 13,
    color: '#64748B',
  },
});
