import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { springConfig } from '../../design/animations';

interface WorkerBioProps {
  bio: string | null;
  style?: ViewStyle;
}

export const WorkerBio: React.FC<WorkerBioProps> = ({ bio, style }) => {
  if (!bio) return null;

  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);

  const handleToggle = () => {
    Haptics.selectionAsync();
    setExpanded(!expanded);
  };

  const onFullLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setFullHeight(height);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    // If we haven't measured the full height yet, or it's short, let it fit contents.
    if (fullHeight === 0) return { maxHeight: undefined };
    const target = expanded ? fullHeight : 90;
    return {
      height: withSpring(target, springConfig.gentle),
    };
  });

  const showToggle = fullHeight > 90;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionHeader}>About</Text>
      
      {/* Hidden view for measuring full height */}
      <View
        style={[styles.measureContainer, { position: 'absolute', opacity: 0, left: -9999 }]}
        onLayout={onFullLayout}
      >
        <Text style={styles.bioText}>{bio}</Text>
      </View>

      {/* Visible animated container */}
      <Animated.View style={[styles.animatedContent, animatedStyle]}>
        <Text
          style={styles.bioText}
          numberOfLines={expanded ? undefined : 4}
        >
          {bio}
        </Text>
      </Animated.View>

      {showToggle && (
        <Pressable
          onPress={handleToggle}
          style={styles.toggleButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.toggleText}>
            {expanded ? 'Show less ↑' : 'Read more ➔'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionHeader: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 16,
    color: colors.textPrimary || '#0F172A',
    marginBottom: 10,
  },
  measureContainer: {
    width: '100%',
  },
  animatedContent: {
    overflow: 'hidden',
    width: '100%',
  },
  bioText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 14,
    color: colors.textSecondary || '#475569',
    lineHeight: 22,
  },
  toggleButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    fontSize: 13,
    color: colors.primary || '#16A34A',
  },
});
