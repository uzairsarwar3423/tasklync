import { FC } from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../design/colors';

interface ZoomControlProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControl: FC<ZoomControlProps> = ({
  onZoomIn,
  onZoomOut,
}) => {
  const handleZoomIn = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onZoomIn();
  };

  const handleZoomOut = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onZoomOut();
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.topButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleZoomIn}
        hitSlop={8}
        accessibilityLabel="Zoom map in"
        accessibilityRole="button"
      >
        <Plus size={20} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.bottomButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleZoomOut}
        hitSlop={8}
        accessibilityLabel="Zoom map out"
        accessibilityRole="button"
      >
        <Minus size={20} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    width: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  button: {
    width: 44,
    height: 44, // Fitts's Law: 44px minimum tap target
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
  },
  buttonPressed: {
    backgroundColor: colors.bgSection,
  },
  topButton: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  bottomButton: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    width: '100%',
  },
});
