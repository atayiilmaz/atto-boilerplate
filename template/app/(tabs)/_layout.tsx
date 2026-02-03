import { Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeTabs, Icon, Label, VectorIcon } from 'expo-router/unstable-native-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAds } from '../../context/AdsContext';
import { useOnboarding } from '../../context/OnboardingContext';

const adUnitId = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { shouldShowAds } = useAds();
  const { hasCompletedOnboarding } = useOnboarding();

  // Check if paywall has been seen
  const hasSeenPaywall = globalThis.localStorage?.getItem('hasSeenPaywall') === 'true';

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!hasSeenPaywall) {
    return <Redirect href="/paywall" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <NativeTabs disableTransparentOnScrollEdge>
          <NativeTabs.Trigger name="index">
            <Icon src={<VectorIcon family={Ionicons} name="home" />} />
            <Label>{t('tabs.home')}</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="settings">
            <Icon src={<VectorIcon family={Ionicons} name="settings" />} />
            <Label>{t('tabs.settings')}</Label>
          </NativeTabs.Trigger>
        </NativeTabs>

        {shouldShowAds && (
          <View style={styles.adContainer}>
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  adContainer: {
    alignItems: 'center',
    paddingBottom: 8,
    paddingTop: 8,
  },
});
