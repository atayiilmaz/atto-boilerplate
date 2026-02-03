# create-atto

Scaffolding CLI for the Atto Expo boilerplate framework.

## Usage

```bash
# Interactive mode
npx create-atto

# With project name
npx create-atto my-app

# With default options
npx create-atto my-app --default
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test locally
npm pack
npx ./create-atto-0.1.0.tgz test-app

# Type check
npm run typecheck
```

## Project Structure

```
create-atto/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── prompts.ts         # User questionnaire
│   ├── scaffolder.ts      # Main scaffolding logic
│   ├── tokens.ts          # Token replacement utilities
│   ├── file-operations.ts # File operations (copy, modify, remove)
│   ├── feature-toggles.ts # Feature toggle configurations
│   └── types.ts           # TypeScript types
├── template/              # Atto boilerplate template (NOT included in repo)
├── package.json
├── tsconfig.json
└── README.md
```

## Template Structure

The `template/` directory should contain the full Expo boilerplate app with ALL features enabled (Firebase, RevenueCat, AdMob). The scaffolder will:

1. Copy the template to the target directory
2. Replace tokens (app name, bundle ID, etc.)
3. Remove features the user didn't select
4. Copy Firebase config files if provided
5. Generate a README with setup instructions

## Feature Toggle Logic

The template includes all features. When a user doesn't select a feature:

| Feature | Files Removed | Files Modified |
|---------|---------------|----------------|
| **Firebase** | `services/firebase/`, `config/features.ts`, Firebase config files | `app/_layout.tsx`, `app/(tabs)/settings.tsx`, `app/(tabs)/index.tsx`, `app/paywall.tsx`, `components/onboarding/OnboardingPager.tsx` |
| **RevenueCat** | `context/PremiumContext.tsx`, `constants/revenuecat.ts`, `app/paywall.tsx` | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `components/onboarding/OnboardingPager.tsx` |
| **AdMob** | `context/AdsContext.tsx`, `constants/ads.ts` | `app/_layout.tsx`, `app/(tabs)/_layout.tsx` |

## Publishing

```bash
npm run build
npm publish
```

## License

MIT
