import { FC } from 'react';
import { StyleSheet, Text, Pressable, Platform } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';

interface MapSearchBarProps {
  placeholder?: string;
}

export const MapSearchBar: FC<MapSearchBarProps> = ({
  placeholder = 'Search services or workers...',
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push('/search');
  };

  const handleFilterPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push('/search/filters');
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      accessibilityRole="search"
      accessibilityLabel="Search services or workers"
    >
      <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
      <Text style={styles.placeholderText} numberOfLines={1}>
        {placeholder}
      </Text>
      <Pressable
        style={styles.filterButton}
        onPress={handleFilterPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Open search filters"
      >
        <SlidersHorizontal size={16} color={colors.primaryDark} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 16,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  searchIcon: {
    marginRight: 10,
  },
  placeholderText: {
    flex: 1,
    fontFamily: typography.fontFamily.jakarta.medium,
    fontSize: typography.fontSize.body2,
    color: colors.textMuted,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
