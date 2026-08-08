import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SlotInfo } from '../../../hooks/useWorkerSlots';
import { TimeSlotChip } from './TimeSlotChip';
import { TimeSlotSkeleton } from './TimeSlotSkeleton';
import { colors, palette, fontFamily } from '../../../design';

export interface TimeSlotGridProps {
  slots: SlotInfo[];
  isLoading: boolean;
  selectedTimeSlot: string | null;
  onSelectSlot: (timeStr: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  isLoading,
  selectedTimeSlot,
  onSelectSlot,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        {!isLoading && slots.length > 0 && (
          <Text style={styles.slotCountText}>
            {slots.filter((s) => s.available).length} available
          </Text>
        )}
      </View>

      <View style={styles.grid}>
        {isLoading
          ? Array.from({ length: 9 }).map((_, idx) => (
              <TimeSlotSkeleton key={`slot-skel-${idx}`} />
            ))
          : slots.map((slot) => (
              <TimeSlotChip
                key={slot.id}
                slot={slot}
                isSelected={selectedTimeSlot === slot.timeStr}
                onSelect={onSelectSlot}
              />
            ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: palette.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  slotCountText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 12,
    color: colors.primaryDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
