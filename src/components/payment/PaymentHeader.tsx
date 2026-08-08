import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, palette, fontFamily } from '../../design';

export interface PaymentHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  title = 'Payment Method',
  subtitle = 'Select your payment card to finalize booking.',
  onBack,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleBack}
        style={styles.backButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Go back to summary"
      >
        <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
      </Pressable>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: palette.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    marginTop: 4,
  },
  title: {
    fontFamily: fontFamily.poppins.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
