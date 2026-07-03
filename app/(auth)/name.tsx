import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Screen } from '@components/layout/Screen';
import { StickyFooter } from '@components/layout/StickyFooter';
import { Text } from '@components/ui/Text';
import { TextInput } from '@components/ui/Input/TextInput';
import { Button } from '@components/ui/Button';
import { colors, fontFamily } from '@design/index';
import { palette } from '../../src/design/colors';
import { useUpdateName } from '@hooks/useAuth';

export default function NameScreen() {
  const [name, setName] = useState('');
  const { updateName, isLoading, error } = useUpdateName();

  const trimmedName = name.trim();
  const isValid = trimmedName.length >= 2;
  const showCount = trimmedName.length > 30;
  const isWarning = trimmedName.length >= 45;

  // Animation for valid state
  const buttonScale = useSharedValue(1);
  const buttonColor = useSharedValue(colors.primaryLight);

  useEffect(() => {
    if (isValid) {
      Haptics.selectionAsync();
      buttonScale.value = withSpring(1.02, { damping: 10, stiffness: 400 }, (finished) => {
        if (finished) {
          buttonScale.value = withSpring(1);
        }
      });
      buttonColor.value = withTiming(colors.primary, { duration: 200 });
    } else {
      buttonColor.value = withTiming(colors.primaryLight, { duration: 200 });
    }
  }, [isValid]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleContinue = () => {
    if (isValid && !isLoading) {
      updateName(trimmedName);
    }
  };

  return (
    <Screen bg={colors.bgCard} statusBarStyle="dark-content">
      <View style={styles.content}>
        <Text style={styles.emoji}>👋</Text>

        <Text variant="h1" color="primary" style={styles.title}>
          What's your name?
        </Text>

        <Text variant="body1" color="muted" style={styles.subtitle}>
          So workers know who they're meeting
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            label="Your name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            autoCapitalize="words"
            maxLength={50}
            onSubmitEditing={handleContinue}
            error={error ?? ''}
            accessibilityLabel="Enter your name"
            accessibilityHint="We'll use this to introduce you to workers"
          />
          {showCount && (
            <Text style={[styles.charCount, isWarning && styles.charCountWarning]}>
              {trimmedName.length} / 50
            </Text>
          )}
        </View>
      </View>

      <StickyFooter noBorder bg="transparent">
        <Animated.View style={animatedButtonStyle}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isValid}
            loading={isLoading}
            onPress={handleContinue}
            style={{ backgroundColor: isValid ? colors.primary : colors.primaryLight }}
            label="Let's go →"
          />
        </Animated.View>
      </StickyFooter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  charCount: {
    fontFamily: fontFamily.inter.regular,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  charCountWarning: {
    color: palette.warning,
  },
});
