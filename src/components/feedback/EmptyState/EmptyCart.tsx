import { FC } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { ShoppingBag, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../design/colors';
import { typography } from '../../../design/typography';

interface EmptyCartProps {
  onBrowseServices?: () => void;
}

export const EmptyCart: FC<EmptyCartProps> = ({ onBrowseServices }) => {
  const router = useRouter();

  const handleBrowse = () => {
    if (onBrowseServices) {
      onBrowseServices();
    } else {
      router.push('/(tabs)/explore');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <ShoppingBag size={36} color={colors.textMuted} />
      </View>

      {/* Poppins font for empty state title */}
      <Text style={styles.title}>Your cart is empty</Text>

      {/* Plus Jakarta Sans for helper copy */}
      <Text style={styles.subtitle}>
        Explore top-rated local workers and add services to get started.
      </Text>

      {/* Hick's Law: Secondary outline CTA button, not primary green */}
      <Pressable
        style={({ pressed }) => [styles.browseButton, pressed && styles.browseButtonPressed]}
        onPress={handleBrowse}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Browse services"
      >
        <Text style={styles.browseButtonText}>Browse Services</Text>
        <ArrowRight size={16} color={colors.primaryDark} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bgSection,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.fontFamily.poppins.semiBold, // Poppins font
    fontSize: typography.fontSize.h3,
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.jakarta.regular, // Plus Jakarta Sans helper copy
    fontSize: typography.fontSize.body2,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 24,
  },
  browseButton: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.primaryTint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  browseButtonPressed: {
    backgroundColor: colors.primaryBorder,
    transform: [{ scale: 0.98 }],
  },
  browseButtonText: {
    fontFamily: typography.fontFamily.jakarta.semiBold, // Plus Jakarta Sans
    fontSize: typography.fontSize.body2,
    color: colors.primaryDark,
  },
});
