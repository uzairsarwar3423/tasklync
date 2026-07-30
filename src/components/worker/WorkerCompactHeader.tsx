import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { ChevronLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../ui/Button/Button';
import { colors } from '../../design/colors';
import { shadows } from '../../design/shadows';
import { typography } from '../../design/typography';
import { WorkerPublicProfile } from '../../types/worker.types';

interface WorkerCompactHeaderProps {
  worker?: WorkerPublicProfile;
  scrollY: SharedValue<number>;
  onBack: () => void;
  onBookNow: () => void;
}

export const WorkerCompactHeader: React.FC<WorkerCompactHeaderProps> = ({
  worker,
  scrollY,
  onBack,
  onBookNow,
}) => {
  const [interactable, setInteractable] = useState(false);

  // We show the header when scroll is past 120px
  useAnimatedReaction(
    () => scrollY.value,
    (value) => {
      const isVisible = value > 120;
      if (isVisible !== interactable) {
        runOnJS(setInteractable)(isVisible);
      }
    },
    [interactable]
  );

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [100, 160], [0, 1], 'clamp');
    const translateY = interpolate(scrollY.value, [80, 140], [-24, 0], 'clamp');

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const handleBackPress = () => {
    Haptics.selectionAsync();
    onBack();
  };

  const handleBookPress = () => {
    onBookNow();
  };

  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      pointerEvents={interactable ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          height: 56 + insets.top,
          paddingTop: insets.top,
        },
        containerAnimatedStyle,
      ]}
    >
      <View style={styles.innerContainer}>
        {/* Back Button */}
        <Pressable
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={12}
        >
          <ChevronLeft size={24} color={colors.textPrimary || '#0F172A'} />
        </Pressable>

        {/* Center: Profile Mini Info */}
        <View style={styles.centerGroup}>
          {worker?.avatarUrl ? (
            <Image
              source={{ uri: worker.avatarUrl }}
              style={styles.avatar}
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]} />
          )}
          <Text style={styles.nameText} numberOfLines={1}>
            {worker?.name || 'Worker'}
          </Text>
        </View>

        {/* Right: Book Button */}
        <Button
          variant="primary"
          size="sm"
          label="Book"
          onPress={handleBookPress}
          disabled={worker?.availabilityStatus === 'UNAVAILABLE' || worker?.availabilityStatus === 'INACTIVE'}
          fullWidth={false}
          style={styles.bookButton}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgCard || '#FFFFFF',
    ...shadows.sm,
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: colors.border || '#F3F4F6',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  centerGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgInput || '#F3F4F6',
  },
  avatarPlaceholder: {
    borderWidth: 1,
    borderColor: colors.border || '#E5E7EB',
  },
  nameText: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 15,
    color: colors.textPrimary || '#0F172A',
    marginLeft: 8,
    flex: 1,
  },
  bookButton: {
    height: 32,
    paddingHorizontal: 12,
    marginRight: 8,
  },
});
