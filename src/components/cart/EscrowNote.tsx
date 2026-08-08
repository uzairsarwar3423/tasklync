import { FC } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';

export const EscrowNote: FC = () => {
  return (
    <View style={styles.container}>
      <ShieldCheck size={14} color={colors.primaryDark} style={styles.icon} />
      {/* Plus Jakarta Sans helper copy */}
      <Text style={styles.text}>
        Payment is held safely in escrow and released only after job completion.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    flex: 1,
    fontFamily: typography.fontFamily.jakarta.regular, // Plus Jakarta Sans helper copy
    fontSize: 11,
    color: colors.primaryDark,
    lineHeight: 15,
  },
});
