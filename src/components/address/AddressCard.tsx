import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Home, Briefcase, MapPin, Check } from 'lucide-react-native';
import { BookingAddress } from '../../store/bookingDraft.store';
import { AddressDefaultBadge } from './AddressDefaultBadge';
import { colors, palette, fontFamily } from '../../design';

export interface AddressCardProps {
  address: BookingAddress;
  isSelected: boolean;
  onSelect: (address: BookingAddress) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected,
  onSelect,
}) => {
  const { label, street, unit, city, isDefault } = address;

  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSpring(1.02, { damping: 14, stiffness: 220 });
    } else {
      scale.value = withTiming(1.0, { duration: 150 });
    }
  }, [isSelected, scale]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(address);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Render appropriate icon based on address label
  const renderIcon = () => {
    const iconColor = isSelected ? colors.primaryDark : palette.gray600;
    const lowerLabel = (label || '').toLowerCase();

    if (lowerLabel.includes('home')) {
      return <Home size={18} color={iconColor} strokeWidth={2.2} />;
    }
    if (lowerLabel.includes('office') || lowerLabel.includes('work')) {
      return <Briefcase size={18} color={iconColor} strokeWidth={2.2} />;
    }
    return <MapPin size={18} color={iconColor} strokeWidth={2.2} />;
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardUnselected,
        animatedStyle,
      ]}
      accessibilityRole="radio"
      accessibilityLabel={`${label || 'Address'}, ${street}, ${city} ${
        isSelected ? 'selected' : ''
      }`}
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.contentRow}>
        {/* Icon Circle */}
        <View
          style={[
            styles.iconCircle,
            isSelected ? styles.iconCircleSelected : styles.iconCircleUnselected,
          ]}
        >
          {renderIcon()}
        </View>

        {/* Text Container */}
        <View style={styles.textContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.labelTitle}>{label || 'Saved Address'}</Text>
            {isDefault && <AddressDefaultBadge />}
          </View>
          <Text style={styles.streetText} numberOfLines={2}>
            {street}
            {unit ? `, ${unit}` : ''}
          </Text>
          <Text style={styles.cityText}>{city}</Text>
        </View>

        {/* Radio Circle */}
        <View
          style={[
            styles.radioOuter,
            isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected,
          ]}
        >
          {isSelected && (
            <View style={styles.radioInner}>
              <Check size={12} color={palette.white} strokeWidth={3} />
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.white,
    marginBottom: 12,
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardUnselected: {
    borderWidth: 1,
    borderColor: palette.gray200,
    shadowOpacity: 0.04,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: palette.green50,
    shadowOpacity: 0.1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconCircleUnselected: {
    backgroundColor: palette.gray100,
  },
  iconCircleSelected: {
    backgroundColor: palette.green100,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  streetText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 3,
  },
  cityText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    marginTop: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterUnselected: {
    borderWidth: 2,
    borderColor: palette.gray300,
  },
  radioOuterSelected: {
    backgroundColor: colors.primary,
  },
  radioInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
