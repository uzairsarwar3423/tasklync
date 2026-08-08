import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PriceSummaryRow } from '../cart/PriceSummaryRow';
import { CartTotalRow } from '../cart/CartTotalRow';
import { EscrowNote } from '../cart/EscrowNote';
import { palette } from '../../design';

export interface BookingPriceSummaryProps {
  subtotal: number;
  platformFee: number;
  urgentFee?: number;
  discount?: number;
  total: number;
  currency?: string;
}

export const BookingPriceSummary: React.FC<BookingPriceSummaryProps> = ({
  subtotal,
  platformFee,
  urgentFee = 0,
  discount = 0,
  total,
}) => {
  return (
    <View style={styles.card}>
      <PriceSummaryRow label="Services Subtotal" amount={subtotal - urgentFee} />

      {urgentFee > 0 && (
        <PriceSummaryRow label="Urgent Dispatch Surge (+30%)" amount={urgentFee} />
      )}

      <PriceSummaryRow label="Platform Service Fee" amount={platformFee} />

      {discount > 0 && (
        <PriceSummaryRow label="Promotional Discount" amount={-discount} />
      )}

      <CartTotalRow total={total} />

      <EscrowNote />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.gray200,
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
});
