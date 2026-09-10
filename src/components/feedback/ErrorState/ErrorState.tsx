import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle, Pressable } from 'react-native';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { fontFamily } from '../../../design/typography';
import { palette } from '../../../design/colors';
import { radius } from '../../../design/radius';

export interface ErrorStateProps {
  type?: 'offline' | 'error' | 'notFound';
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  retryButtonText?: string;
  isRetrying?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * ErrorState / Fullscreen Offline State Component (Day 39)
 * 
 * Implements Section 10 & 11:
 * - "No internet connection" cold-start screen
 * - Poppins SemiBold 20px title
 * - Jakarta Regular 14px subtitle
 * - 64px iconography with soft tinted background container
 * - Accessible retry button
 */
export const ErrorState: React.FC<ErrorStateProps> = React.memo(({
  type = 'offline',
  title,
  subtitle,
  onRetry,
  retryButtonText = 'Try Again',
  isRetrying = false,
  style,
}) => {
  const isOfflineType = type === 'offline';

  const displayTitle =
    title ||
    (isOfflineType
      ? 'No internet connection'
      : 'Something went wrong');

  const displaySubtitle =
    subtitle ||
    (isOfflineType
      ? 'Please check your connection or Wi-Fi settings and try again.'
      : 'An unexpected error occurred while loading this page.');

  const handleRetry = () => {
    onRetry?.();
  };

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`${displayTitle}. ${displaySubtitle}`}
    >
      <View
        style={[
          styles.iconContainer,
          isOfflineType ? styles.iconContainerOffline : styles.iconContainerError,
        ]}
      >
        {isOfflineType ? (
          <WifiOff size={36} color={palette.warningDark} strokeWidth={2} />
        ) : (
          <AlertTriangle size={36} color={palette.danger} strokeWidth={2} />
        )}
      </View>

      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.subtitle}>{displaySubtitle}</Text>

      {onRetry && (
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
            isRetrying && styles.retryButtonDisabled,
          ]}
          onPress={handleRetry}
          disabled={isRetrying}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={retryButtonText}
        >
          {isRetrying && (
            <RefreshCw size={15} color={palette.white} />
          )}
          <Text 
            style={styles.retryButtonText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isRetrying ? 'Retrying…' : retryButtonText}
          </Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: palette.zenWhite,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  iconContainerOffline: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  iconContainerError: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  title: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: palette.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 14,
    lineHeight: 22,
    color: palette.gray600,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 320,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: palette.green500,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    minWidth: 108,
    gap: 8,
  },
  retryButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: palette.green600,
  },
  retryButtonDisabled: {
    opacity: 0.7,
  },
  retryButtonText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: palette.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    alignSelf: 'center',
  },
});
