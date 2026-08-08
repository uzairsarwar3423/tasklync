import { FC } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { typography } from '../../design/typography';
import { colors } from '../../design/colors';

interface MapPanelHeaderProps {
  count: number;
  isLoading?: boolean;
  categoryLabel?: string | null;
}

export const MapPanelHeader: FC<MapPanelHeaderProps> = ({
  count,
  isLoading = false,
  categoryLabel,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLoading ? (
          'Finding workers nearby...'
        ) : count === 0 ? (
          'No workers nearby'
        ) : (
          `${count} ${count === 1 ? 'worker' : 'workers'} nearby`
        )}
      </Text>
      {categoryLabel && (
        <Text style={styles.subtitle} numberOfLines={1}>
          Filtered by <Text style={styles.categoryHighlight}>{categoryLabel}</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  title: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: typography.fontSize.h4,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: typography.fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  categoryHighlight: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    color: colors.primaryDark,
  },
});
