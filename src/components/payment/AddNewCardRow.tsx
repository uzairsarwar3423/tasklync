import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus, ChevronRight } from 'lucide-react-native';
import { colors, palette, fontFamily } from '../../design';

export interface AddNewCardRowProps {
  onPress: () => void;
  title?: string;
  subtitle?: string;
}

export const AddNewCardRow: React.FC<AddNewCardRowProps> = ({
  onPress,
  title = 'Add Payment Method',
  subtitle = 'Debit/Credit Card, JazzCash, or EasyPaisa',
}) => {
  const handlePress = () => {
    onPress();
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.rowContainer,
          pressed && styles.rowPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Add new payment method"
      >
        <View style={styles.leftGroup}>
          <View style={styles.plusCircle}>
            <Plus size={18} color={colors.primaryDark} strokeWidth={2.4} />
          </View>
          <View style={styles.textColumn}>
            <Text style={styles.titleText}>{title}</Text>
            {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
          </View>
        </View>

        <ChevronRight size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
};

// Compatibility export
export const AddNewPaymentMethodRow = AddNewCardRow;

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.gray200,
    borderStyle: 'dashed',
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  rowPressed: {
    backgroundColor: palette.gray50,
    borderColor: colors.primary,
    transform: [{ scale: 0.99 }],
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
  },
  titleText: {
    fontFamily: fontFamily.inter.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  subtitleText: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    marginTop: 2,
  },
});
