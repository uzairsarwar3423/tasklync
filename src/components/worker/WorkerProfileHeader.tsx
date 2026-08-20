import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { ChevronLeft, Share2, MoreVertical } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ProfileHeroGradient } from './ProfileHeroGradient';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { WorkerPublicProfile } from '../../types/worker.types';

interface WorkerProfileHeaderProps {
  worker?: WorkerPublicProfile;
  scrollY: SharedValue<number>;
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
  const animatedHeroStyle = useAnimatedStyle(() => {
    // Subtle parallax when scrolling up, gentle stretch when pulling down
    const scale = interpolate(scrollY.value, [-100, 0], [1.06, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 200], [0, -30], Extrapolation.CLAMP);

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [40, 140], [1, 0], Extrapolation.CLAMP);
    return {
      opacity,
    };
  });

  const handleBack = () => {
    Haptics.selectionAsync();
    onBack();
  };

  const handleShare = () => {
    Haptics.selectionAsync();
    onShare();
  };

  const handleMore = () => {
    Haptics.selectionAsync();
    onMore();
  };

  return (
    <Animated.View style={[styles.container, animatedHeroStyle]}>
      <ProfileHeroGradient height={280}>
        {/* Layer 2: Absolute Top Header Actions */}
        <View style={[styles.actionsContainer, { paddingTop: 12 }]}>
          <Pressable
            onPress={handleBack}
            style={styles.actionIconButton}
            hitSlop={12}
          >
            <ChevronLeft size={24} color="#FFFFFF" style={styles.shadowIcon} />
          </Pressable>

          <View style={styles.rightActions}>
            <Pressable
              onPress={handleShare}
              style={styles.actionIconButton}
              hitSlop={12}
            >
              <Share2 size={20} color="#FFFFFF" style={styles.shadowIcon} />
            </Pressable>
            <Pressable
              onPress={handleMore}
              style={styles.actionIconButton}
              hitSlop={12}
            >
              <MoreVertical size={20} color="#FFFFFF" style={styles.shadowIcon} />
            </Pressable>
          </View>
        </View>

        {/* Layer 3: Absolute Bottom Name and Avatar */}
        <Animated.View style={[styles.bottomInfo, animatedContentStyle]}>
          <View style={styles.avatarWrapper}>
            {worker?.avatarUrl ? (
              <Image
                source={{ uri: worker.avatarUrl }}
                style={styles.avatar}
                transition={200}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
          </View>

          <View style={styles.textWrapper}>
            <Text style={styles.nameText} numberOfLines={1}>
              {worker?.name || 'Worker'}
            </Text>
            <Text style={styles.cityText} numberOfLines={1}>
              {(() => {
                const firstCat = worker?.categories?.[0];
                if (typeof firstCat === 'string' && firstCat.trim()) return firstCat;
                if (firstCat && typeof firstCat === 'object') {
                  return (firstCat as any).categoryName || (firstCat as any).name || 'Professional';
                }
                const firstSkill = worker?.skills?.[0];
                if (firstSkill && typeof firstSkill === 'object') {
                  return firstSkill.categoryName || 'Professional';
                }
                return 'Professional';
              })()} · {worker?.city || 'Lahore'}
            </Text>
          </View>
        </Animated.View>
      </ProfileHeroGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280,
    backgroundColor: '#0F172A',
    zIndex: 1,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 24, // Keep offset from overlap card (24px)
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgInput || '#F3F4F6',
  },
  avatarPlaceholder: {
    borderWidth: 1,
    borderColor: colors.border || '#E5E7EB',
  },
  textWrapper: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 4,
  },
  nameText: {
    fontFamily: typography.fontFamily.poppins.bold,
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cityText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
