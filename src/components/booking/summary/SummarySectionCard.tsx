import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, palette, fontFamily } from '../../../design';

export interface SummarySectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  rightAction?: ReactNode;
}

export const SummarySectionCard: React.FC<SummarySectionCardProps> = ({
  icon,
  title,
  children,
  rightAction,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>{icon}</View>
          <Text style={styles.title}>{title}</Text>
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>

      <View style={styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.gray100,
    padding: 18,
    marginBottom: 14,
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray100,
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  body: {
    width: '100%',
  },
});
