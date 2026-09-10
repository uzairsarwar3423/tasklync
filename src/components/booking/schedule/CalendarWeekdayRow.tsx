import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, palette, fontFamily } from '../../../design';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarWeekdayRow: React.FC = React.memo(() => {
  return (
    <View style={styles.container}>
      {WEEKDAYS.map((day, idx) => (
        <View key={day} style={styles.cell}>
          <Text style={[styles.text, idx === 0 && styles.sundayText]}>{day}</Text>
        </View>
      ))}
    </View>
  );
});

CalendarWeekdayRow.displayName = 'CalendarWeekdayRow';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  sundayText: {
    color: palette.gray500,
  },
});
