import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CreditCard, Check, Banknote, Smartphone } from 'lucide-react-native';
import { SavedPaymentMethod } from '../../services/api/payment.api';
import { AddressDefaultBadge } from '../address/AddressDefaultBadge';
import { colors, palette, fontFamily } from '../../design';

export interface PaymentMethodCardProps {
  method: SavedPaymentMethod;
  isSelected: boolean;
  onSelect: (method: SavedPaymentMethod) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isSelected,
  onSelect,
}) => {
  const { id, type, brand, last4, expMonth, expYear, isDefault, holderName, title, subtitle } = method;

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
    onSelect(method);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isCash = id === 'CASH' || type === 'cash';
  const isWallet = id === 'JAZZCASH' || type === 'wallet';

  const cardTitle = title
    ? title
    : isCash
    ? 'Cash on Delivery'
    : isWallet
    ? 'JazzCash / EasyPaisa'
    : `${(brand || 'Card').toUpperCase()} •••• ${last4 || '4242'}`;

  const cardSubtitle = subtitle
    ? subtitle
    : isCash
    ? 'Pay directly in cash after service completion'
    : isWallet
    ? 'Direct mobile wallet prompt'
    : expMonth && expYear
    ? `Expires ${String(expMonth).padStart(2, '0')}/${String(expYear).slice(-2)}${
        holderName ? ` • ${holderName}` : ''
      }`
    : 'Online Payment';

  const renderIcon = () => {
    if (isCash) {
      return <Banknote size={22} color={isSelected ? colors.primaryDark : palette.gray600} strokeWidth={2} />;
    }
    if (isWallet) {
      return <Smartphone size={22} color={isSelected ? colors.primaryDark : palette.gray600} strokeWidth={2} />;
    }
    return <CreditCard size={20} color={isSelected ? colors.primaryDark : palette.gray600} strokeWidth={2} />;
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
      accessibilityLabel={`${cardTitle} ${isSelected ? 'selected' : ''}`}
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.contentRow}>
        {/* Brand Icon Circle */}
        <View
          style={[
            styles.iconCircle,
            isSelected ? styles.iconCircleSelected : styles.iconCircleUnselected,
          ]}
        >
          {renderIcon()}
        </View>

        {/* Card Details */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle} numberOfLines={1}>
              {cardTitle}
            </Text>
            {isDefault && <AddressDefaultBadge />}
          </View>
          <Text style={styles.subText} numberOfLines={2}>
            {cardSubtitle}
          </Text>
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontFamily: fontFamily.inter.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  subText: {
    fontFamily: fontFamily.inter.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 3,
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
