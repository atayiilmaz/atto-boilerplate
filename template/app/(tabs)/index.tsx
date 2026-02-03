import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { NavigationBar, HeroCard, FeatureCard, StatusBarCard } from '../../components/dashboard';
import { Body } from '../../components/ui/Typography';
import { firebaseAnalytics } from '../../services/firebase';

type FeatureKey = 'analytics' | 'users' | 'database' | 'uiKit';

const FEATURE_ICONS: Record<FeatureKey, string> = {
  analytics: 'bar-chart',
  users: 'people',
  database: 'storage',
  uiKit: 'grid-view',
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleFeaturePress = (feature: FeatureKey) => {
    firebaseAnalytics.logEvent('feature_selected', {
      feature_name: feature,
    });
    // TODO: Navigate to feature screen
  };

  const handleViewDocs = () => {
    firebaseAnalytics.logEvent('docs_viewed', {
      source: 'hero_card',
    });
    // TODO: Open docs
  };

  const handleShare = () => {
    firebaseAnalytics.logEvent('share_pressed', {
      source: 'hero_card',
    });
    // TODO: Implement share
  };

  const handleNotifications = () => {
    firebaseAnalytics.logEvent('notifications_opened', {
      source: 'home_screen',
    });
    // TODO: Open notifications
  };

  const handleViewLogs = () => {
    firebaseAnalytics.logEvent('logs_viewed', {
      source: 'status_card',
    });
    // TODO: Open logs
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <NavigationBar
        userName={t('dashboard.user')}
        onNotificationPress={handleNotifications}
        testID="home-navigation-bar"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <HeroCard
          onViewDocs={handleViewDocs}
          onShare={handleShare}
          testID="home-hero-card"
        />

        {/* Feature Grid */}
        <View style={styles.section}>
          <View style={styles.featureGrid}>
            <FeatureCard
              icon={FEATURE_ICONS.analytics}
              title={t('dashboard.analytics')}
              description={t('dashboard.analyticsDesc')}
              onPress={() => handleFeaturePress('analytics')}
              testID="home-feature-analytics"
            />
            <FeatureCard
              icon={FEATURE_ICONS.users}
              title={t('dashboard.users')}
              description={t('dashboard.usersDesc')}
              onPress={() => handleFeaturePress('users')}
              testID="home-feature-users"
            />
          </View>
          <View style={styles.featureGridSecondRow}>
            <FeatureCard
              icon={FEATURE_ICONS.database}
              title={t('dashboard.database')}
              description={t('dashboard.databaseDesc')}
              onPress={() => handleFeaturePress('database')}
              testID="home-feature-database"
            />
            <FeatureCard
              icon={FEATURE_ICONS.uiKit}
              title={t('dashboard.uiKit')}
              description={t('dashboard.uiKitDesc')}
              onPress={() => handleFeaturePress('uiKit')}
              testID="home-feature-uikit"
            />
          </View>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <StatusBarCard
            onPress={handleViewLogs}
            testID="home-status-bar"
          />
        </View>

        {/* Footer Version Info */}
        <View style={styles.footer}>
          <Body style={styles.footerText} color="secondary">
            {t('dashboard.version')} • {t('dashboard.buildDate')}
          </Body>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  section: {
    marginTop: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  featureGridSecondRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
    opacity: 0.6,
  },
});
