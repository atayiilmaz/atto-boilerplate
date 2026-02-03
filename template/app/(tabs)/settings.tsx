import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { SettingsListItem, SettingsToggleRow, LanguageModal } from '../../components/settings';
import { firebaseAnalytics } from '../../services/firebase';
import { Body, Title } from '../../components/ui/Typography';
import i18n from '../../lib/i18n';

const PRIVACY_POLICY_URL = 'https://example.com/privacy';
const TERMS_OF_SERVICE_URL = 'https://example.com/terms';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme, theme } = useTheme();
  const colors = theme?.colors || {};

  // State
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Firebase Auth
  const user = getAuth().currentUser;
  const userId = user?.uid || 'Guest';

  const handleLanguagePress = () => {
    setShowLanguageModal(true);
    firebaseAnalytics.logEvent('language_settings_opened');
  };

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLanguage(code);
    firebaseAnalytics.logEvent('language_changed', {
      language: code,
    });
  };

  const handleNotificationsPress = () => {
    setNotificationsEnabled(!notificationsEnabled);
    firebaseAnalytics.logEvent('notifications_toggled', {
      enabled: !notificationsEnabled,
    });
  };

  const handlePrivacyPolicyPress = async () => {
    firebaseAnalytics.logEvent('privacy_policy_opened');
    await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  };

  const handleTermsPress = async () => {
    firebaseAnalytics.logEvent('terms_of_service_opened');
    await WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(getAuth());
              firebaseAnalytics.logEvent('user_logged_out');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ],
    );
  };

  const isDark = colorScheme === 'dark';

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Body style={styles.sectionHeaderText}>{title}</Body>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backButton} testID="settings-back-button">
          {/* <MaterialIcons name="arrow-back-ios" size={24} color={colors.text} /> */}
        </Pressable>
        <Title style={styles.topBarTitle}>{t('settings.title')}</Title>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        {renderSectionHeader(t('settings.account'))}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {/* Profile */}
          <SettingsListItem
            icon="person"
            title={t('settings.profile')}
            value={userId}
            testID="settings-profile"
          />
        </View>

        {/* Application Section */}
        {renderSectionHeader(t('settings.application'))}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {/* Dark Mode Toggle */}
          <SettingsToggleRow
            icon="bedtime"
            title={t('settings.darkMode')}
            value={isDark}
            onValueChange={(value) => {
              setColorScheme(value ? 'dark' : 'light');
              firebaseAnalytics.logEvent('dark_mode_toggled', { enabled: value });
            }}
            testID="settings-dark-mode"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {/* Notifications */}
          <SettingsListItem
            icon="notifications"
            title={t('settings.notifications')}
            value={notificationsEnabled ? t('settings.on') : t('settings.off')}
            onPress={handleNotificationsPress}
            testID="settings-notifications"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {/* Language */}
          <SettingsListItem
            icon="language"
            title={t('settings.language')}
            value={currentLanguage.toUpperCase()}
            onPress={handleLanguagePress}
            testID="settings-language"
          />
        </View>

        {/* Legal Section */}
        {renderSectionHeader(t('settings.support'))}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {/* Privacy Policy */}
          <SettingsListItem
            icon="verified"
            title={t('settings.privacyPolicy')}
            onPress={handlePrivacyPolicyPress}
            testID="settings-privacy"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {/* Terms of Service */}
          <SettingsListItem
            icon="description"
            title={t('settings.terms')}
            onPress={handleTermsPress}
            testID="settings-terms"
          />
        </View>

        {/* Logout Button */}
        {/* <View style={styles.logoutContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={handleLogout}
            testID="settings-logout"
          >
            <MaterialIcons name="logout" size={20} color="#DC2626" />
            <Body style={styles.logoutButtonText}>{t('settings.logout')}</Body>
          </Pressable>
        </View> */}

        {/* Version Info */}
        <Body style={[styles.version, { color: '#617589' }]} color="secondary">
          {t('dashboard.version')} • {t('dashboard.buildDate')}
        </Body>
      </ScrollView>

      {/* Language Modal */}
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onSelectLanguage={handleSelectLanguage}
        currentLanguage={currentLanguage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  topBarSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.6,
    letterSpacing: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
  },
  logoutContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutButtonPressed: {
    backgroundColor: '#FEE2E2',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    fontSize: 12,
    opacity: 0.4,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
});
