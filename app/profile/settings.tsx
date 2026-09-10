import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, ShieldCheck, Globe, DollarSign } from 'lucide-react-native';

import { useAppPreferences } from '../../src/hooks/useAppPreferences';
import { useNotificationPreferences } from '../../src/hooks/useNotificationPreferences';
import {
  SettingsSection,
  SettingsRow,
  LanguageToggle,
  CurrencyToggle,
  NotificationPreferenceGroup,
  AppVersionRow,
} from '../../src/components/settings';
import { colors, palette, fontFamily, fontSize, spacing } from '../../src/design';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { language, currency, setLanguage, setCurrency } = useAppPreferences();
  const { preferences, togglePreference } = useNotificationPreferences();

  const handleBack = () => {
    router.back();
  };

  const handleOpenLegal = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (_e) {}
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgApp} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} maxFontSizeMultiplier={1.3}>
          App Settings
        </Text>

        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* 1. Preferences Section (Language & Currency) */}
        <SettingsSection title="Preferences">
          <SettingsRow
            label="App Language"
            subtitle="Choose your preferred interface language"
            icon={<Globe size={20} color={colors.primaryDark} />}
            rightElement={
              <LanguageToggle value={language} onChange={setLanguage} />
            }
          />

          <SettingsRow
            label="Display Currency"
            subtitle="Pricing format displayed across services"
            icon={<DollarSign size={20} color={colors.primaryDark} />}
            rightElement={
              <CurrencyToggle value={currency} onChange={setCurrency} />
            }
          />
        </SettingsSection>

        {/* 2. Notifications Section */}
        <SettingsSection title="Notifications">
          <NotificationPreferenceGroup
            preferences={preferences}
            onToggle={togglePreference}
          />
        </SettingsSection>

        {/* 3. About & Legal Section */}
        <SettingsSection title="About & Legal">
          <SettingsRow
            label="Terms of Service"
            subtitle="Customer rights and escrow protection policy"
            icon={<FileText size={20} color={palette.gray600} />}
            showChevron={true}
            onPress={() => handleOpenLegal('https://tasklync.pk/terms')}
          />

          <SettingsRow
            label="Privacy Policy"
            subtitle="Data encryption and privacy standards"
            icon={<ShieldCheck size={20} color={palette.gray600} />}
            showChevron={true}
            onPress={() => handleOpenLegal('https://tasklync.pk/privacy')}
          />

          <AppVersionRow version="v1.0.0" buildNumber="Build 37" />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgApp,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.iceGray,
  },
  headerTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h3,
    color: colors.textPrimary,
  },
  headerRightSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
});
