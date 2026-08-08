import { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { PriceSummaryRow } from './PriceSummaryRow';
import { CartTotalRow } from './CartTotalRow';
import { EscrowNote } from './EscrowNote';
import { CartTotals } from '../../hooks/useCartTotals';
import { colors } from '../../design/colors';

interface CartSummaryProps {
  totals: CartTotals;
}

export const CartSummary: FC<CartSummaryProps> = ({ totals }) => {
  return (
    <View style={styles.card}>
      <PriceSummaryRow label="Subtotal" amount={totals.subtotal} />
      <PriceSummaryRow label="Platform Fee (5%)" amount={totals.platformFee} />
      <CartTotalRow total={totals.total} />
      <EscrowNote />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
});
