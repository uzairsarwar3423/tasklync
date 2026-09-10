import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { colors, fontFamily, spacing } from '../../design';

export interface AppVersionRowProps {
  version?: string;
  buildNumber?: string;
}

export const AppVersionRow: React.FC<AppVersionRowProps> = ({
  version = 'v1.0.0',
  buildNumber = 'Build 37',
}) => {
  const [tapCount, setTapCount] = useState<number>(0);

  const handleTap = () => {
    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (nextCount >= 5) {
      setTapCount(0);
      Alert.alert(
        'Developer Diagnostics',
        `Tasklync Customer App\nVersion: ${version}\nBuild: ${buildNumber}\nPlatform: ${Platform.OS} (${Platform.Version})\nAPI Target: production (https://api.tasklync.pk/api/v1)\nEnvironment: Production Release`,
        [{ text: 'Dismiss', style: 'default' }]
      );
    }
  };

  const displayText = `${version} (${buildNumber})`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleTap}
      style={styles.container}
      accessibilityRole="none"
      accessibilityLabel={`App version ${displayText}`}
    >
      <Text style={styles.label} maxFontSizeMultiplier={1.3}>
        App Version
      </Text>
      <Text style={styles.versionText} maxFontSizeMultiplier={1.3}>
        {displayText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  label: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  versionText: {
    fontFamily: fontFamily.inter.regular,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
});
