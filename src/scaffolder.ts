import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import * as inquirer from '@inquirer/prompts';
import type { Answers } from './types.js';
import { getFeatureToggle, ADS_CONTEXT_WITHOUT_REVENUECAT } from './feature-toggles.js';
import {
  copyTemplate,
  removeFiles,
  applyFeatureToggles,
  modifyFile,
} from './file-operations.js';
import {
  generateTokenMap,
  replaceTokensInAppJson,
  replaceTokensInPackageJson,
  replaceTokensInFile,
  shouldReplaceTokensInFile,
} from './tokens.js';
import fg from 'fast-glob';

/**
 * Main scaffolder function
 */
export async function runScaffolder(
  answers: Answers,
  templateDir: string,
  skipConfirm: boolean = false
): Promise<void> {
  const targetDir = path.resolve(process.cwd(), answers.projectName);

  // Check if target directory exists
  if (await fs.exists(targetDir)) {
    if (!skipConfirm) {
      const confirm = await inquirer.confirm({
        message: `Directory "${answers.projectName}" already exists. Overwrite?`,
        default: false,
      });

      if (!confirm) {
        throw new Error('Cancelled by user');
      }
    }
    await fs.remove(targetDir);
  }

  let spinner: Ora;

  // Step 1: Copy template
  spinner = ora('Copying template files...').start();
  try {
    await copyTemplate(templateDir, targetDir);
    spinner.succeed('Template files copied');
  } catch (error) {
    spinner.fail('Failed to copy template');
    throw error;
  }

  // Step 2: Apply token replacements
  spinner = ora('Applying project configuration...').start();
  try {
    const tokens = generateTokenMap(answers.projectName, answers.bundleId);

    // Replace in app.json
    await replaceTokensInAppJson(path.join(targetDir, 'app.json'), tokens);

    // Replace in package.json
    await replaceTokensInPackageJson(path.join(targetDir, 'package.json'), tokens);

    // Replace in all relevant files
    const files = await fg('**/*', {
      cwd: targetDir,
      ignore: ['node_modules/**', 'dist/**', '.git/**', 'ios/**', 'android/**'],
    });

    for (const file of files) {
      const filePath = path.join(targetDir, file);
      if (shouldReplaceTokensInFile(filePath)) {
        await replaceTokensInFile(filePath, tokens);
      }
    }

    spinner.succeed('Project configuration applied');
  } catch (error) {
    spinner.fail('Failed to apply configuration');
    throw error;
  }

  // Step 3: Copy Firebase config files if provided
  if (answers.features.includes('firebase')) {
    spinner = ora('Copying Firebase configuration...').start();
    try {
      if (answers.googleServicesPath) {
        await fs.copy(
          answers.googleServicesPath,
          path.join(targetDir, 'google-services.json')
        );
      }
      if (answers.googleServiceInfoPlistPath) {
        await fs.copy(
          answers.googleServiceInfoPlistPath,
          path.join(targetDir, 'GoogleService-Info.plist')
        );
      }
      spinner.succeed('Firebase configuration copied');
    } catch (error) {
      spinner.fail('Failed to copy Firebase configuration');
      throw error;
    }
  }

  // Step 4: Apply feature toggles
  spinner = ora('Applying feature configuration...').start();
  try {
    // Determine which features to DISABLE (remove from template)
    // The template includes all features, so we remove what user didn't select
    const allFeatures: Array<'firebase' | 'revenuecat' | 'admob'> = [
      'firebase',
      'revenuecat',
      'admob',
    ];

    const featuresToDisable = allFeatures.filter(
      (f) => !answers.features.includes(f)
    );

    for (const feature of featuresToDisable) {
      const config = getFeatureToggle(feature);
      await removeFiles(targetDir, config.filesToRemove);
      await applyFeatureToggles(targetDir, [config]);
    }

    // Special case: If RevenueCat is disabled but AdMob is enabled,
    // modify AdsContext to not depend on PremiumContext
    if (
      !answers.features.includes('revenuecat') &&
      answers.features.includes('admob')
    ) {
      await modifyFile(targetDir, ADS_CONTEXT_WITHOUT_REVENUECAT);
    }

    spinner.succeed('Feature configuration applied');
  } catch (error) {
    spinner.fail('Failed to apply feature configuration');
    throw error;
  }

  // Step 5: Create README with next steps
  spinner = ora('Creating README...').start();
  try {
    await createReadme(targetDir, answers);
    spinner.succeed('README created');
  } catch (error) {
    spinner.fail('Failed to create README');
    throw error;
  }

  // Step 6: Clean up any leftover files
  spinner = ora('Cleaning up...').start();
  try {
    await cleanupTargetDir(targetDir);
    spinner.succeed('Cleanup complete');
  } catch (error) {
    spinner.warn('Some cleanup items failed (non-critical)');
  }
}

/**
 * Create README with next steps based on selected features
 */
async function createReadme(targetDir: string, answers: Answers): Promise<void> {
  const { projectName, packageManager, features } = answers;

  const installCmd = getInstallCommand(packageManager);

  let content = `# ${projectName}

This project was created with the Atto Expo boilerplate.

## Getting Started

### 1. Install dependencies

\`\`\`bash
${installCmd}
\`\`\`

### 2. Run prebuild to generate native code

\`\`\`bash
npx expo prebuild --clean
\`\`\`

### 3. Run on iOS

\`\`\`bash
npx expo run:ios
\`\`\`

### 4. Run on Android

\`\`\`bash
npx expo run:android
\`\`\`

`;

  if (features.includes('firebase')) {
    content += `## Firebase Setup

Firebase is enabled in this project. You need to add your Firebase configuration files:

\`\`\`
google-services.json       # Place in root directory
GoogleService-Info.plist   # Place in root directory
\`\`\`

Get these files from the [Firebase Console](https://console.firebase.google.com/).

### Firebase Features

This template includes the following Firebase modules:

- **Analytics**: Track user behavior and events
- **Auth**: Anonymous authentication (expandable to email, Google, etc.)
- **Firestore**: NoSQL database for your app data

### Firebase Configuration

Firebase is configured through environment variables in \`app.json\`:

\`\`\`json
{
  "extra": {
    "ENABLE_FIREBASE": true,
    "ENABLE_FIRESTORE": true,
    "ENABLE_ANALYTICS": true
  }
}
\`\`\`

`;
  }

  if (features.includes('revenuecat')) {
    content += `## RevenueCat Setup

RevenueCat is enabled for in-app purchases and subscriptions.

### Configuration

Update the RevenueCat API key in \`context/PremiumContext.tsx\`:

\`\`\`typescript
const REVENUECAT_API_KEY = __DEV__
  ? 'test_ExwHJlBQFhvbgXjSWUFdziAEYKI' // Test key
  : 'YOUR_REVENUECAT_API_KEY'; // Replace with production key
\`\`\`

Get your API key from the [RevenueCat Dashboard](https://app.revenuecat.com/).

### Products

Products are configured in \`constants/revenuecat.ts\`. Update these to match your products in RevenueCat.

`;
  }

  if (features.includes('admob')) {
    content += `## AdMob Setup

AdMob is enabled for displaying banner ads.

### Configuration

1. Update ad unit IDs in \`constants/ads.ts\`:

\`\`\`typescript
export const AD_UNITS = {
  BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your ad unit ID
};
\`\`\`

2. Update app IDs in \`app.json\`:

\`\`\`json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
        "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
      }
    ]
  ]
}
\`\`\`

Get your ad unit IDs and app IDs from the [AdMob Console](https://apps.admob.com/).

`;
  }

  content += `## Project Structure

\`\`\`
${projectName}/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with providers
│   ├── (tabs)/            # Bottom tab navigation
│   ├── onboarding.tsx     # Onboarding flow
└── paywall.tsx            # Paywall screen (if RevenueCat enabled)
├── components/            # Reusable components
│   ├── dashboard/        # Dashboard components
│   ├── settings/         # Settings components
│   └── ui/               # Base UI components
├── constants/            # App constants
├── context/              # React Context providers
├── hooks/                # Custom hooks
├── lib/                  # Utilities
├── locales/              # i18n translations
└── services/             # External services (Firebase, etc.)
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run android\` - Run on Android
- \`npm run ios\` - Run on iOS
- \`npm run web\` - Run on web
- \`npm run lint\` - Run ESLint
- \`npm run typecheck\` - Run TypeScript check

## Documentation

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)

Happy coding! 🚀
`;

  await fs.writeFile(path.join(targetDir, 'README.md'), content, 'utf-8');
}

/**
 * Get install command based on package manager
 */
function getInstallCommand(packageManager: string): string {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm install';
    case 'yarn':
      return 'yarn';
    case 'bun':
      return 'bun install';
    case 'npm':
    default:
      return 'npm install';
  }
}

/**
 * Clean up target directory
 */
async function cleanupTargetDir(targetDir: string): Promise<void> {
  // Remove any leftover cache files
  const patterns = [
    '**/.cache/**',
    '**/.turbo/**',
    '**/.DS_Store',
    '**/npm-debug.log*',
    '**/yarn-debug.log*',
    '**/yarn-error.log*',
  ];

  const files = await fg(patterns, {
    cwd: targetDir,
    dot: true,
    absolute: false,
  });

  for (const file of files) {
    await fs.remove(path.join(targetDir, file));
  }

  // Ensure .gitignore exists
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (!(await fs.exists(gitignorePath))) {
    await fs.writeFile(
      gitignorePath,
      `# Dependencies
node_modules/
.pnp/
.pnp.js

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
*.cer
.cxx/
ios/
android/

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*
.pnpm-debug.*

# Local env files
.env*.local
.env

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/

# Misc
*.log
*.tgz
`
    );
  }
}
