import React, { useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import {
  Zap,
  Droplet,
  Wind,
  Sparkles,
  Hammer,
  Paintbrush,
  Grid,
} from 'lucide-react-native';
import { Category } from '../../types/category.types';
import { Chip } from '../ui/Chip/Chip';

interface CategoryRowProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category | null) => void;
  includeAll?: boolean;
  style?: ViewStyle;
}

const CATEGORY_ICON_MAP: Record<string, any> = {
  electrician: Zap,
  plumber: Droplet,
  ac_repair: Wind,
  cleaning: Sparkles,
  carpenter: Hammer,
  painter: Paintbrush,
};

export const CategoryRow: React.FC<CategoryRowProps> = ({
  categories,
  selectedId,
  onSelect,
  includeAll = true,
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // We can add simple scroll-to-active logic if desired.
  // In Expo/React Native, we can also let the ScrollView flow naturally.

  const handleSelect = (category: Category | null) => {
    onSelect(category);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
    >
      {includeAll && (
        <Chip
          label="All"
          selected={selectedId === null}
          onPress={() => handleSelect(null)}
          size="md"
          variant="filter"
          showCheckmark={false}
          icon={Grid}
        />
      )}

      {categories.map((category) => {
        const IconComponent = CATEGORY_ICON_MAP[category.id] || Grid;
        return (
          <Chip
            key={category.id}
            label={category.name}
            selected={category.id === selectedId}
            onPress={() => handleSelect(category)}
            size="md"
            variant="filter"
            showCheckmark={false}
            icon={IconComponent}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 52,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
});
