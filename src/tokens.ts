import path from 'path';
import fs from 'fs-extra';
import type { TokenMap } from './types.js';

/**
 * Generate token replacement map from user answers
 */
export function generateTokenMap(projectName: string, bundleId: string): TokenMap {
  // Generate scheme from project name (remove special chars, lowercase)
  const scheme = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 50);

  // Display name is just the project name with proper casing
  const displayName = projectName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    projectName,
    displayName,
    iosBundleIdentifier: bundleId,
    androidPackage: bundleId,
    scheme,
  };
}

/**
 * Token replacements for app.json
 *
 * Based on inspection findings:
 * - name: "expo-boilerplate-app"
 * - slug: "expo-boilerplate-app"
 * - scheme: "expoboilerplateapp"
 * - ios.bundleIdentifier: "com.syntaxnj.expoboilerplateapp"
 * - android.package: "com.syntaxnj.expoboilerplateapp"
 * - AdMob androidAppId and iosAppId
 */
export const APP_JSON_TOKENS = {
  // Current hardcoded values in the template
  NAME: 'expo-boilerplate-app',
  SLUG: 'expo-boilerplate-app',
  SCHEME: 'expoboilerplateapp',
  IOS_BUNDLE_IDENTIFIER: 'com.syntaxnj.expoboilerplateapp',
  ANDROID_PACKAGE: 'com.syntaxnj.expoboilerplateapp',
  IOS_APPLE_TEAM_ID: '85USFDDWST',
  ADMOB_ANDROID_APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  ADMOB_IOS_APP_ID: 'ca-app-pub-3940256099942544~1458002511',
} as const;

/**
 * Token replacements for package.json
 */
export const PACKAGE_JSON_TOKENS = {
  NAME: 'expo-boilerplate-app',
} as const;

/**
 * Replace tokens in app.json
 */
export async function replaceTokensInAppJson(
  appJsonPath: string,
  tokens: TokenMap
): Promise<void> {
  const appJson = await fs.readJson(appJsonPath);

  // Replace name
  appJson.name = tokens.projectName;
  appJson.expo.name = tokens.displayName;
  appJson.expo.slug = tokens.projectName;
  appJson.expo.scheme = tokens.scheme;

  // Replace iOS bundle identifier
  if (appJson.expo.ios) {
    appJson.expo.ios.bundleIdentifier = tokens.iosBundleIdentifier;
    // Keep appleTeamId as is or generate a placeholder
    // appJson.expo.ios.appleTeamId = 'YOUR_TEAM_ID';
  }

  // Replace Android package
  if (appJson.expo.android) {
    appJson.expo.android.package = tokens.androidPackage;
  }

  await fs.writeJson(appJsonPath, appJson, { spaces: 2 });
}

/**
 * Replace tokens in package.json
 */
export async function replaceTokensInPackageJson(
  packageJsonPath: string,
  tokens: TokenMap
): Promise<void> {
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.name = tokens.projectName;

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

/**
 * Replace tokens in a text file
 */
export function replaceTokensInContent(
  content: string,
  tokens: TokenMap
): string {
  let result = content;

  // Replace app.json token patterns
  result = result.replace(/expo-boilerplate-app/g, tokens.projectName);
  result = result.replace(/expoboilerplateapp/g, tokens.scheme);
  result = result.replace(/com\.syntaxnj\.expoboilerplateapp/g, tokens.iosBundleIdentifier);
  result = result.replace(/Expo Boilerplate App/g, tokens.displayName);

  return result;
}

/**
 * Replace tokens in a file
 */
export async function replaceTokensInFile(
  filePath: string,
  tokens: TokenMap
): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const newContent = replaceTokensInContent(content, tokens);
  await fs.writeFile(filePath, newContent, 'utf-8');
}

/**
 * Check if a file should have tokens replaced (by extension)
 */
export function shouldReplaceTokensInFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath).toLowerCase();

  return (
    ext === '.json' ||
    ext === '.ts' ||
    ext === '.tsx' ||
    ext === '.js' ||
    ext === '.jsx' ||
    basename === 'app.json' ||
    basename === 'package.json'
  );
}
