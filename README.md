<div align="center">

<img src="https://github.com/atayiilmaz/atto-boilerplate/blob/main/src/appicon.png" alt="Atto Logo" width="200" />

#### ──── • Atto Boilerplate • ────
**Fast • Feature-rich • Production-ready**

[![npm version](https://badge.fury.io/js/create-atto.svg)](https://www.npmjs.org/package/create-atto)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A production-ready Expo React Native boilerplate with essential integrations.**

Start your next Expo project in seconds, not hours.

</div>

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Post-Installation Setup](#post-installation-setup)
- [Configuration](#configuration)
- [Feature Integrations](#feature-integrations)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Features

Atto provides a solid foundation for your Expo React Native app with:

- **⚡️ Fast Setup** - Create a new project in seconds with interactive CLI
- **🎨 Beautiful UI** - Pre-built, customizable components with dark mode support
- **🌍 Internationalization** - Built-in i18n with support for 4+ languages
- **📱 Onboarding Flow** - Smooth, animated onboarding experience
- **🔐 Firebase Integration** - Analytics, Auth, and Firestore (optional)
- **💰 RevenueCat** - In-app purchases and subscriptions (optional)
- **📺 AdMob** - Banner ad integration (optional)
- **🎯 Type-Safe** - Full TypeScript support
- **🧭 Expo Router** - File-based routing with NativeTabs

---

## Quick Start

### Create a new project

```bash
# Interactive mode (recommended)
npx create-atto my-app

# With default options
npx create-atto my-app --default

# Skip confirmation prompts
npx create-atto my-app --yes
```

### Follow the setup prompts

The CLI will guide you through:

1. **Project name** - Your app's folder and display name
2. **Bundle identifier** - e.g., `com.company.myapp`
3. **Package manager** - npm, pnpm, yarn, or bun
4. **Features** - Choose which integrations to include:
   - Firebase (Analytics, Auth, Firestore)
   - RevenueCat (In-app purchases)
   - AdMob (Banner ads)

### Complete the installation

```bash
cd my-app

# Install dependencies
npm install

# Generate native code
npx expo prebuild --clean

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

---

## Project Structure

```
my-app/
├── app/                      # Expo Router pages (file-based routing)
│   ├── _layout.tsx          # Root layout with providers
│   ├── (tabs)/              # Bottom tab navigation
│   │   ├── _layout.tsx      # Tabs layout with BannerAd
│   │   ├── index.tsx        # Home screen
│   │   └── settings.tsx     # Settings screen
│   ├── onboarding.tsx       # Onboarding flow
│   └── paywall.tsx          # RevenueCat paywall (if enabled)
├── components/              # Reusable React components
│   ├── dashboard/          # Dashboard-specific components
│   ├── onboarding/         # Onboarding flow components
│   ├── settings/           # Settings screen components
│   └── ui/                 # Base UI components (Button, Card, Typography, etc.)
├── config/                 # Feature flags and configuration
├── constants/              # App constants (Ad units, RevenueCat entitlements)
├── context/                # React Context providers
│   ├── ThemeContext.tsx    # Light/dark theme management
│   ├── OnboardingContext.tsx
│   ├── PremiumContext.tsx  # RevenueCat premium status (if enabled)
│   └── AdsContext.tsx      # Ad display logic (if enabled)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── i18n.ts            # i18next internationalization setup
│   └── storage.ts         # Local storage polyfill
├── locales/               # Translation files (en, es, de, tr)
├── services/              # External service integrations
│   └── firebase/         # Firebase modules (if enabled)
├── assets/               # Images, fonts, and static assets
├── app.json             # Expo configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

---

## Technologies

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Expo** | ~54.0 | Development platform |
| **React Native** | 0.81.5 | Mobile framework |
| **Expo Router** | ~6.0 | File-based navigation |
| **TypeScript** | ~5.9 | Type safety |

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo-sqlite` | Local database for storage |
| `i18next` | Internationalization |
| `@expo/vector-icons` | Icon library |
| `expo-linear-gradient` | Gradient backgrounds |

### Optional Integrations

| Feature | Package | Version |
|---------|---------|---------|
| **Firebase** | `@react-native-firebase/*` | 23.7.0 |
| **RevenueCat** | `react-native-purchases` | ^9.7.5 |
| **AdMob** | `react-native-google-mobile-ads` | ^16.0.3 |

---

## Post-Installation Setup

After creating your project, you'll need to configure the optional features you selected.

### 1. Firebase Configuration

If you enabled Firebase, add your configuration files to the project root:

```
my-app/
├── google-services.json      # Android Firebase config
├── GoogleService-Info.plist  # iOS Firebase config
```

**Getting your config files:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Add an Android app:
   - Download `google-services.json`
   - Place in project root
4. Add an iOS app:
   - Download `GoogleService-Info.plist`
   - Place in project root

**Firebase Features Included:**

| Feature | Description | File |
|---------|-------------|------|
| Analytics | Event tracking throughout the app | `services/firebase/analytics.ts` |
| Auth | Anonymous authentication | `services/firebase/auth.ts` |
| Firestore | NoSQL database | `services/firebase/firestore.ts` |

**Feature Flags:**

Configure Firebase features in `app.json`:

```json
{
  "expo": {
    "extra": {
      "ENABLE_FIREBASE": true,
      "ENABLE_FIRESTORE": true,
      "ENABLE_ANALYTICS": true
    }
  }
}
```

---

### 2. RevenueCat Configuration

If you enabled RevenueCat, update your API key:

**File:** `context/PremiumContext.tsx`

```typescript
const REVENUECAT_API_KEY = __DEV__
  ? 'test_ExwHJlBQFhvbgXjSWUFdziAEYKI' // Test key
  : 'YOUR_REVENUECAT_API_KEY'; // ← Replace this!
```

**Getting your API key:**

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Create a new project
3. Copy your API key
4. Update `PremiumContext.tsx`

**Configure Products:**

Edit `constants/revenuecat.ts` to match your RevenueCat products:

```typescript
export const REVENUECAT = {
  ENTITLEMENT_ID: 'premium', // Your entitlement ID
} as const;

export const PRODUCTS = {
  PREMIUM_MONTHLY: 'premium_monthly',  // Your product ID
  PREMIUM_YEARLY: 'premium_yearly',    // Your product ID
} as const;
```

---

### 3. AdMob Configuration

If you enabled AdMob, update your ad unit IDs:

**File:** `constants/ads.ts`

```typescript
export const AD_UNITS = {
  BANNER: __DEV__
    ? 'ca-app-pub-3940256099942544/6300978111' // Test ID
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // ← Your ad unit ID
} as const;
```

**Update App IDs in `app.json`:**

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY", // ← Your Android app ID
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"      // ← Your iOS app ID
        }
      ]
    ]
  }
}
```

**Getting your AdMob IDs:**

1. Go to [AdMob Console](https://apps.admob.com/)
2. Create a new app
3. Create an ad unit (Banner)
4. Copy the app IDs and ad unit ID
5. Update the files above

---

## Configuration

### App Identity

Update your app's identity in `app.json`:

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "scheme": "myapp",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.company.myapp",
      "appleTeamId": "YOUR_TEAM_ID"
    },
    "android": {
      "package": "com.company.myapp"
    }
  }
}
```

### Localization

Add new languages by:

1. Creating a new locale file: `locales/{languageCode}/common.json`
2. Adding translations to the file
3. Updating `lib/i18n.ts` to import the new locale

**Example:**

```typescript
// locales/fr/common.json
{
  "tabs": {
    "home": "Accueil",
    "settings": "Paramètres"
  }
  // ...
}
```

---

## Feature Integrations

### How Features Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                      app/_layout.tsx                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ThemeProvider (Required)                │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │        OnboardingProvider (Required)          │  │   │
│  │  │  ┌─────────────────────────────────────────┐  │  │   │
│  │  │  │     PremiumProvider (RevenueCat)        │  │  │   │
│  │  │  │  ┌───────────────────────────────────┐  │  │  │   │
│  │  │  │  │    AdsProvider (AdMob)            │  │  │  │   │
│  │  │  │  │                                   │  │  │  │   │
│  │  │  │  │  ┌─────────────────────────────┐  │  │  │  │   │
│  │  │  │  │  │     Root Navigation         │  │  │  │  │   │
│  │  │  │  │  │  (Tabs, Onboarding, Paywall)│  │  │  │  │   │
│  │  │  │  │  └─────────────────────────────┘  │  │  │  │   │
│  │  │  │  └───────────────────────────────────┘  │  │  │   │
│  │  │  └─────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Provider Dependencies

| Provider | Required By | Purpose |
|----------|-------------|---------|
| `ThemeProvider` | All | Provides theme context (light/dark) |
| `OnboardingProvider` | All | Tracks onboarding completion |
| `PremiumProvider` | `AdsProvider` | Manages premium status (RevenueCat) |
| `AdsProvider` | Tabs | Controls ad visibility based on premium status |

### Firebase Integration Points

| File | Usage |
|------|-------|
| `app/_layout.tsx` | Initialize Firebase, sign in anonymously |
| `app/(tabs)/settings.tsx` | Display user ID, handle logout |
| `app/(tabs)/index.tsx` | Track screen view events |
| `app/paywall.tsx` | Track purchase events |
| `components/onboarding/OnboardingPager.tsx` | Track onboarding completion |

---

## Development

### Contributing to Atto

We welcome contributions! Here's how to get started:

1. **Fork and clone the repository**

```bash
git clone https://github.com/your-username/create-atto.git
cd create-atto
```

2. **Install dependencies**

```bash
npm install
```

3. **Build the project**

```bash
npm run build
```

4. **Test locally**

```bash
npm pack
npx ./create-atto-0.1.0.tgz test-app
```

5. **Make changes and test**

```bash
npm run build    # Rebuild after changes
npm pack        # Create new tgz
npx ./create-atto-0.1.0.tgz test-app   # Test again
```

### Project Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run dev` | Watch mode for development |
| `npm run prepack` | Build before packing |
| `npm run typecheck` | Type check without emitting |

### Code Style

- Use TypeScript for all files
- Follow ESLint configuration
- Use ESM modules (`import`/`export`)
- Add JSDoc comments for exported functions

---

## CLI Options

```
Usage: create-atto [project-name] [options]

Arguments:
  project-name          Name of the project

Options:
  -d, --default         Skip prompts and use defaults
  --yes                 Skip confirmation prompts
  -v, --version         Output the version number
  -h, --help            Display help

Examples:
  $ npx create-atto my-app
  $ npx create-atto my-app --default
  $ npx create-atto --help
```

---

## Troubleshooting

### Common Issues

**Issue:** `Template not found`

**Solution:** Make sure you're running the published npm package. The template is bundled with the package.

**Issue:** Firebase errors

**Solution:** Verify your `google-services.json` and `GoogleService-Info.plist` are in the project root.

**Issue:** RevenueCat purchases not working

**Solution:** Check that your API key is correct and products match your RevenueCat dashboard.

**Issue:** Ads not showing

**Solution:** In development, AdMob uses test IDs. In production, update with your real ad unit IDs.

---

## Roadmap

- [ ] Web support with Expo Web
- [ ] Push notifications
- [ ] Deep linking support
- [ ] More payment providers (Stripe, Paddle)
- [ ] Additional ad formats (Interstitial, Rewarded)
- [ ] Analytics dashboards
- [ ] E2E testing setup

---

## License

MIT © Ata Berk Yılmaz

---

## Links

- **npm:** [https://www.npmjs.com/package/create-atto](https://www.npmjs.com/package/create-atto)
- **GitHub:** [https://github.com/atayiilmaz/atto-boilerplate](https://github.com/atayiilmaz/atto-boilerplate)
- **Expo Docs:** [https://docs.expo.dev](https://docs.expo.dev)
- **React Native:** [https://reactnative.dev](https://reactnative.dev)

---

<div align="center">

**Built with ❤️ for the React Native community**

</div>
