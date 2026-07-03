import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput as RNTextInput } from 'react-native';
import { Text } from '@components/ui/Text';
import { colors, radius } from '@design/index';
import { ChevronDown } from 'lucide-react-native';

interface PhoneInputProps {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  countryCode?: string;
  countryFlag?: string;
  onCountryPress?: () => void;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
}

export const PhoneInput = ({
  value,
  onChangeText,
  error,
  countryCode = '+92',
  countryFlag = '🇵🇰',
  onCountryPress,
  autoFocus = true,
  onSubmitEditing,
}: PhoneInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // Focus border state
  const borderColor = error ? colors.borderError : isFocused ? colors.primary : 'transparent';

  return (
    <View>
      <View style={[styles.container, { borderColor }]}>
        <Pressable 
          style={styles.countrySection} 
          onPress={onCountryPress ? onCountryPress : () => console.log('Country picker pressed')}
        >
          <Text style={styles.flag}>{countryFlag}</Text>
          <Text style={styles.code}>{countryCode}</Text>
          <ChevronDown size={14} color={colors.textMuted} />
        </Pressable>

        <View style={styles.divider} />

        <RNTextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder="3XX XXXXXXX"
          placeholderTextColor={colors.textMuted}
          maxLength={10}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
        />
      </View>
      {!!error && (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  countrySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  flag: {
    fontSize: 20,
    marginRight: 6,
  },
  code: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 4,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.border,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textPrimary,
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  errorText: {
    color: colors.textDanger,
    marginTop: 8,
    marginLeft: 4,
  },
});
