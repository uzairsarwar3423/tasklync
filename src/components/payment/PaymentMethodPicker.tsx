import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PaymentMethod } from '../../types/payment.types';
import { CardBrandIcon } from './CardBrandIcon';
import { colors, palette, fontFamily, radius, spacing, shadows } from '../../design';
import { Check } from 'lucide-react-native';

export interface PaymentMethodPickerProps {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({
  methods,
  selectedId,
  onSelect,
}) => {
  const handleSelect = (method: PaymentMethod) => {
    onSelect(method);
  };

  return (
    <View style={styles.container}>
      {methods.map((method) => {
        const isSelected = method.id === selectedId;
        const line1 = method.account_number || (method.last4 ? `•••• ${method.last4}` : method.title);
        const line2 =
          method.type === 'cash'
            ? 'Pay in cash after service completion'
            : method.type === 'wallet'
            ? `${method.brand === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Wallet`
            : method.subtitle;

        return (
          <TouchableOpacity
            key={method.id}
            activeOpacity={0.7}
            onPress={() => handleSelect(method)}
            style={[
              styles.itemRow,
              isSelected ? styles.itemSelected : styles.itemUnselected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${method.title}, ${line2}`}
          >
            {/* Left Brand Icon */}
            <View style={styles.iconBox}>
              <CardBrandIcon brand={method.brand} size="md" />
            </View>

            {/* Middle Details */}
            <View style={styles.infoBox}>
              <View style={styles.titleRow}>
                <Text style={styles.titleText} numberOfLines={1}>
                  {line1}
                </Text>
                {method.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitleText} numberOfLines={1}>
                {line2}
              </Text>
            </View>

            {/* Right Radio Indicator */}
            <View
              style={[
                styles.radioOuter,
                isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected,
              ]}
            >
              {isSelected && <Check size={12} color={palette.white} strokeWidth={3} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm + 2,
  },
  itemRow: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    ...shadows.xs,
  },
  itemUnselected: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemSelected: {
    borderWidth: 2,
    borderColor: palette.green500,
    backgroundColor: palette.green50,
  },
  iconBox: {
    marginRight: spacing.md,
  },
  infoBox: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontFamily: fontFamily.inter.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: palette.green100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  defaultBadgeText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 10,
    color: palette.green800,
  },
  subtitleText: {
    fontFamily: fontFamily.inter.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterUnselected: {
    borderWidth: 1.5,
    borderColor: palette.gray300,
  },
  radioOuterSelected: {
    backgroundColor: palette.green500,
  },
});
