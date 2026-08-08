import { FC } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { SearchX, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';

interface MapEmptyStateProps {
  onResetFilters: () => void;
}

export const MapEmptyState: FC<MapEmptyStateProps> = ({
  onResetFilters,
}) => {
  const handleReset = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onResetFilters();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <SearchX size={26} color={colors.textMuted} />
      </View>

      <Text style={styles.title}>No workers found nearby</Text>

      <Text style={styles.subtitle}>
        Try changing your selected category or widening your search radius.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.resetButtonPressed,
        ]}
        onPress={handleReset}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Reset map category filters"
      >
        <RotateCcw size={14} color={colors.textSecondary} style={styles.resetIcon} />
        <Text style={styles.resetButtonText}>Reset filters</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bgSection,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: typography.fontSize.body1,
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.jakarta.regular, // Plus Jakarta Sans helper text
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    maxWidth: 260,
  },
  resetButton: {
    height: 44, // Fitts's Law touch target height
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.bgInput,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonPressed: {
    backgroundColor: colors.bgSection,
    transform: [{ scale: 0.98 }],
  },
  resetIcon: {
    marginRight: 6,
  },
  resetButtonText: {
    fontFamily: typography.fontFamily.jakarta.medium,
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
});
