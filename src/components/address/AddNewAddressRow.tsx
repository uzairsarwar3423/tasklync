import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus, ChevronRight } from 'lucide-react-native';
import { colors, palette, fontFamily } from '../../design';

export interface AddNewAddressRowProps {
  onAdd?: () => void;
  onPress?: () => void;
}

export const AddNewAddressRow: React.FC<AddNewAddressRowProps> = ({ onAdd, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onAdd) {
      onAdd();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.rowContainer,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Add new delivery address"
    >
      <View style={styles.leftGroup}>
        <View style={styles.plusCircle}>
          <Plus size={18} color={colors.primaryDark} strokeWidth={2.4} />
        </View>
        <Text style={styles.titleText}>Add new address</Text>
      </View>

      <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  rowPressed: {
    backgroundColor: palette.gray50,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.primaryDark,
  },
});
