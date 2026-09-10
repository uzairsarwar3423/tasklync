import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BookingStatus } from '../../types/booking.types';
import { bookingActionsMap, BookingActionConfig } from '../../utils/bookingActionsMap';

interface BookingActionsProps {
  status: BookingStatus;
  onAction: (action: string) => void;
}

export function BookingActions({ status, onAction }: BookingActionsProps) {
  const actions = bookingActionsMap[status];

  if (!actions || actions.length === 0) return null;

  return (
    <View style={styles.container}>
      {actions.map((actionConfig: BookingActionConfig, index: number) => {
        const isPrimary = actionConfig.variant === 'primary';
        const isDanger = actionConfig.variant === 'danger';
        
        let buttonStyle = styles.buttonSecondary;
        let textStyle = styles.textSecondary;
        
        if (isPrimary) {
          buttonStyle = styles.buttonPrimary;
          textStyle = styles.textPrimary;
        } else if (isDanger) {
          buttonStyle = styles.buttonDanger;
          textStyle = styles.textDanger;
        }

        return (
          <Pressable
            key={actionConfig.action}
            style={({ pressed }) => [
              styles.button,
              buttonStyle,
              index > 0 && styles.buttonMargin,
              pressed && { opacity: 0.85 }
            ]}
            onPress={() => onAction(actionConfig.action)}
          >
            <Text 
              style={[styles.text, textStyle]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {actionConfig.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMargin: {
    marginLeft: 12,
  },
  buttonPrimary: {
    backgroundColor: '#16A34A',
  },
  buttonSecondary: {
    backgroundColor: '#F3F4F6',
  },
  buttonDanger: {
    backgroundColor: '#FEF2F2',
  },
  text: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#374151',
  },
  textDanger: {
    color: '#DC2626',
  },
});
