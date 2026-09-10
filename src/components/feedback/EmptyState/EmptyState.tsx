import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../design/colors';
import { Button } from '../../ui/Button';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  fullWidthAction?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  fullWidthAction = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <View style={[styles.actionContainer, fullWidthAction ? { width: '100%' } : { alignSelf: 'center' }]}>
          <Button 
            label={actionLabel} 
            onPress={onAction} 
            variant="secondary" 
            size="md" 
            fullWidth={fullWidthAction}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    width: '100%',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
