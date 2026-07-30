import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Chip } from '../ui/Chip/Chip';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { springConfig } from '../../design/animations';
import { WorkerSkill } from '../../types/worker.types';

interface WorkerSkillListProps {
  skills: WorkerSkill[];
  maxVisibleRows?: number;
  style?: ViewStyle;
}

export const WorkerSkillList: React.FC<WorkerSkillListProps> = ({
  skills,
  maxVisibleRows = 3,
  style,
}) => {
  if (!skills || skills.length === 0) return null;

  const [expanded, setExpanded] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  // Sort: Verified skills first
  const sortedSkills = [...skills].sort((a, b) => {
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;
    return 0;
  });

  const handleToggle = () => {
    Haptics.selectionAsync();
    setExpanded(!expanded);
  };

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setContainerHeight(height);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (containerHeight === 0) return { maxHeight: undefined };
    
    // Collapsed max height approximation:
    // 3 rows of chips (height ~30 each + gap 8) = ~106px
    const collapsedHeight = 114;
    const target = expanded ? containerHeight : collapsedHeight;
    return {
      height: withSpring(target, springConfig.gentle),
    };
  });

  // Decide if we need to show the toggle.
  // Standard approximation: if skills.length > 6, we likely have more than 3 rows.
  const showToggle = sortedSkills.length > 6;
  const visibleSkills = expanded ? sortedSkills : sortedSkills.slice(0, 6);
  const remainingCount = sortedSkills.length - 6;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionHeader}>Skills & Expertise</Text>
      
      {/* Hidden full container for layout measurement */}
      <View
        style={[styles.measureContainer, { position: 'absolute', opacity: 0, left: -9999 }]}
        onLayout={onLayout}
      >
        <View style={styles.chipGrid}>
          {sortedSkills.map((skill) => (
            <Chip
              key={`measure-${skill.id}`}
              variant={skill.isVerified ? 'skill' : 'tag'}
              selected={skill.isVerified}
              label={skill.isVerified ? `✓ ${skill.categoryName}` : skill.categoryName}
              size="sm"
              style={styles.chip}
            />
          ))}
        </View>
      </View>

      {/* Animated visible container */}
      <Animated.View style={[styles.animatedContent, animatedStyle]}>
        <View style={styles.chipGrid}>
          {visibleSkills.map((skill, index) => (
            <Animated.View
              key={skill.id}
              entering={ZoomIn.duration(200).delay(index * 30)}
            >
              <Chip
                variant={skill.isVerified ? 'skill' : 'tag'}
                selected={skill.isVerified}
                label={skill.isVerified ? `✓ ${skill.categoryName}` : skill.categoryName}
                size="sm"
                style={styles.chip}
              />
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {showToggle && (
        <Pressable
          onPress={handleToggle}
          style={styles.toggleButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.toggleText}>
            {expanded ? 'Show fewer skills' : `Show ${remainingCount} more skills ➔`}
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  toggleButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    fontSize: 13,
    color: colors.primary || '#16A34A',
  },
});
