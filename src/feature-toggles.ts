import type { FeatureToggleConfig } from './types.js';

/**
 * Firebase feature toggle configuration
 *
 * Based on inspection findings:
 * - services/firebase/ directory with index.ts, auth.ts, firestore.ts, analytics.ts, types.ts
 * - config/features.ts for feature flags
 * - Used in: app/_layout.tsx, app/(tabs)/settings.tsx, app/(tabs)/index.tsx, app/paywall.tsx, components/onboarding/OnboardingPager.tsx
 * - Plugins in app.json: @react-native-firebase/app, @react-native-firebase/auth
 * - Config files: google-services.json, GoogleService-Info.plist
 */
export const FIREBASE_TOGGLE: FeatureToggleConfig = {
  filesToRemove: [
    'services/firebase',
    'config/features.ts',
    'google-services.json',
    'GoogleService-Info.plist',
  ],
  filesToModify: [
    {
      path: 'app/_layout.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-import',
          pattern: "import { initFirebase, signInAnonymously, setUserId } from '../services/firebase';",
        },
        {
          type: 'remove-call',
          pattern: /initFirebase\(\)\.then/,
        },
        {
          type: 'remove-call',
          pattern: /signInAnonymously\(\)\.then/,
        },
      ],
    },
    {
      path: 'app/(tabs)/settings.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-import',
          pattern: "import { getAuth, signOut } from '@react-native-firebase/auth';",
        },
        {
          type: 'remove-import',
          pattern: "import { firebaseAnalytics } from '../../services/firebase';",
        },
        {
          type: 'remove-line',
          pattern: /const user = getAuth\(\)\.currentUser;/,
        },
        {
          type: 'remove-line',
          pattern: /const userId = user\?\.uid \|\| 'Guest';/,
        },
        {
          type: 'replace',
          pattern: /value=\{userId\}/,
          replacement: 'value="Guest"',
        },
      ],
    },
    {
      path: 'app/(tabs)/index.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-import',
          pattern: "import { firebaseAnalytics } from '../../services/firebase';",
        },
        {
          type: 'remove-line',
          pattern: /firebaseAnalytics\.logEvent\(/,
        },
      ],
    },
    {
      path: 'app/paywall.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-import',
          pattern: "import { firebaseAnalytics } from '../services/firebase';",
        },
        {
          type: 'remove-line',
          pattern: /firebaseAnalytics\.logEvent\(/,
        },
      ],
    },
    {
      path: 'components/onboarding/OnboardingPager.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-import',
          pattern: "import { firebaseAnalytics } from '../../services/firebase';",
        },
        {
          type: 'remove-line',
          pattern: /firebaseAnalytics\.logEvent\(/,
        },
      ],
    },
  ],
  dependenciesToRemove: [
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    '@react-native-firebase/firestore',
    '@react-native-firebase/analytics',
  ],
  pluginsToRemove: [
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
  ],
  providersToRemove: [],
  contextsToRemove: [],
};

/**
 * RevenueCat feature toggle configuration
 *
 * Based on inspection findings:
 * - context/PremiumContext.tsx - Premium provider
 * - constants/revenuecat.ts - RevenueCat constants
 * - app/paywall.tsx - Paywall screen
 * - AdsContext depends on PremiumContext
 */
export const REVENUECAT_TOGGLE: FeatureToggleConfig = {
  filesToRemove: [
    'context/PremiumContext.tsx',
    'constants/revenuecat.ts',
    'app/paywall.tsx',
  ],
  filesToModify: [
    {
      path: 'app/_layout.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-provider',
          pattern: /<PremiumProvider>[\s\S]*?<\/PremiumProvider>/g,
        },
        {
          type: 'remove-import',
          pattern: "import { PremiumProvider } from '../context/PremiumContext';",
        },
      ],
    },
    {
      path: 'app/(tabs)/_layout.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-line',
          pattern: /const navigation = useNavigation\(\);/,
        },
        {
          type: 'remove-call',
          pattern: /if \(!isPremium\) \{[\s\S]*?navigation\.navigate\('paywall'\)[\s\S]*?\}/,
        },
      ],
    },
    {
      path: 'components/onboarding/OnboardingPager.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-line',
          pattern: /const navigation = useNavigation\(\);/,
        },
        {
          type: 'remove-call',
          pattern: /if \(!isPremium\) \{[\s\S]*?navigation\.navigate\('paywall'\)[\s\S]*?\}/,
        },
      ],
    },
  ],
  dependenciesToRemove: [
    'react-native-purchases',
  ],
  pluginsToRemove: [],
  providersToRemove: ['PremiumProvider'],
  contextsToRemove: ['PremiumContext'],
};

/**
 * AdMob feature toggle configuration
 *
 * Based on inspection findings:
 * - context/AdsContext.tsx - Ads provider
 * - constants/ads.ts - Ad unit IDs
 * - app/(tabs)/_layout.tsx - Contains BannerAd
 * - Depends on PremiumContext for showing/hiding ads
 */
export const ADMOB_TOGGLE: FeatureToggleConfig = {
  filesToRemove: [
    'context/AdsContext.tsx',
    'constants/ads.ts',
  ],
  filesToModify: [
    {
      path: 'app/_layout.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-provider',
          pattern: /<AdsProvider>[\s\S]*?<\/AdsProvider>/g,
        },
        {
          type: 'remove-import',
          pattern: "import { AdsProvider } from '../context/AdsContext';",
        },
      ],
    },
    {
      path: 'app/(tabs)/_layout.tsx',
      operation: 'modify',
      modifications: [
        {
          type: 'remove-import',
          pattern: "import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';",
        },
        {
          type: 'remove-import',
          pattern: "import { useAds } from '../../context/AdsContext';",
        },
        {
          type: 'remove-line',
          pattern: /const \{ shouldShowAds \} = useAds\(\);/,
        },
        {
          type: 'remove-line',
          pattern: /const adUnitId = __DEV__[\s\S]*?;$/m,
        },
        {
          type: 'remove-line',
          pattern: /\{shouldShowAds && \([\s\S]*?<BannerAd[\s\S]*?<\/View>\)\}/,
        },
      ],
    },
  ],
  dependenciesToRemove: [
    'react-native-google-mobile-ads',
  ],
  pluginsToRemove: [
    ['react-native-google-mobile-ads', {
      androidAppId: 'ca-app-pub-3940256099942544~3347511713',
      iosAppId: 'ca-app-pub-3940256099942544~1458002511',
    }],
  ],
  providersToRemove: ['AdsProvider'],
  contextsToRemove: ['AdsContext'],
};

/**
 * Get feature toggle configuration by feature name
 */
export function getFeatureToggle(feature: string): FeatureToggleConfig {
  switch (feature) {
    case 'firebase':
      return FIREBASE_TOGGLE;
    case 'revenuecat':
      return REVENUECAT_TOGGLE;
    case 'admob':
      return ADMOB_TOGGLE;
    default:
      throw new Error(`Unknown feature: ${feature}`);
  }
}

/**
 * When RevenueCat is removed but AdMob is enabled, AdsContext needs modification
 * to not depend on PremiumContext
 */
export const ADS_CONTEXT_WITHOUT_REVENUECAT: import('./types.js').FileOperation = {
  path: 'context/AdsContext.tsx',
  operation: 'modify',
  modifications: [
    {
      type: 'remove-import',
      pattern: "import { usePremium } from './PremiumContext';",
    },
    {
      type: 'replace',
      pattern: /const \{ isPremium \} = usePremium\(\);/,
      replacement: 'const isPremium = false; // Always show ads when RevenueCat is disabled',
    },
  ],
};
