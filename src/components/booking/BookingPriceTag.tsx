import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BookingPriceTagProps {
  amount: number;
  currency: string;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export function BookingPriceTag({ amount, currency }: BookingPriceTagProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.price}>{formatCurrency(amount, currency)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  price: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
});
