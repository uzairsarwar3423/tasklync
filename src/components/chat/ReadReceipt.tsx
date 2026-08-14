import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react-native';
import { ReadReceiptStatus } from '../../types/chat.types';

interface ReadReceiptProps {
  status: ReadReceiptStatus;
  color?: string | undefined;
}

export const ReadReceipt = React.memo(function ReadReceipt({
  status,
  color,
}: ReadReceiptProps) {
  const iconSize = 13;

  switch (status) {
    case 'sending':
      return (
        <View style={styles.container}>
          <Clock size={iconSize - 2} color={color || 'rgba(255, 255, 255, 0.7)'} />
        </View>
      );

    case 'failed':
      return (
        <View style={styles.container}>
          <AlertCircle size={iconSize} color="#EF4444" />
        </View>
      );

    case 'read':
      return (
        <View style={styles.container}>
          <CheckCheck size={iconSize} color="#60A5FA" />
        </View>
      );

    case 'delivered':
      return (
        <View style={styles.container}>
          <CheckCheck size={iconSize} color={color || 'rgba(255, 255, 255, 0.75)'} />
        </View>
      );

    case 'sent':
    default:
      return (
        <View style={styles.container}>
          <Check size={iconSize} color={color || 'rgba(255, 255, 255, 0.75)'} />
        </View>
      );
  }
});

const styles = StyleSheet.create({
  container: {
    marginLeft: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
