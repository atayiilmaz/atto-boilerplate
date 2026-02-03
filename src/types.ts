/**
 * Answers collected from user prompts
 */
export interface Answers {
  /** Name of the project (folder name and display name) */
  projectName: string;
  /** Bundle identifier (e.g., com.company.app) */
  bundleId: string;
  /** Package manager to use */
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
  /** Selected features */
  features: Feature[];
  /** Path to google-services.json (if Firebase enabled) */
  googleServicesPath?: string;
  /** Path to GoogleService-Info.plist (if Firebase enabled) */
  googleServiceInfoPlistPath?: string;
}

/**
 * Optional features that can be toggled
 */
export type Feature = 'firebase' | 'revenuecat' | 'admob';

/**
 * Firebase configuration
 */
export interface FirebaseConfig {
  /** Path to google-services.json */
  googleServicesPath?: string;
  /** Path to GoogleService-Info.plist */
  googleServiceInfoPlistPath?: string;
}

/**
 * Token replacement map
 */
export interface TokenMap {
  /** Project name (folder name and package name) */
  projectName: string;
  /** Display name (shown in app) */
  displayName: string;
  /** Bundle identifier for iOS */
  iosBundleIdentifier: string;
  /** Package name for Android */
  androidPackage: string;
  /** Scheme for deep linking */
  scheme: string;
}

/**
 * File operations for feature toggles
 */
export interface FileOperation {
  /** Path relative to project root */
  path: string;
  /** Operation to perform */
  operation: 'remove' | 'modify';
  /** Modifications to apply (for 'modify' operations) */
  modifications?: Modification[];
}

/**
 * Single modification within a file
 */
export interface Modification {
  /** Type of modification */
  type: 'remove-line' | 'remove-import' | 'remove-provider' | 'remove-call' | 'replace';
  /** Pattern to match */
  pattern: string | RegExp;
  /** Replacement content (for 'replace' type) */
  replacement?: string;
}

/**
 * Feature toggle configuration
 */
export interface FeatureToggleConfig {
  /** Files to remove */
  filesToRemove: string[];
  /** Files to modify */
  filesToModify: FileOperation[];
  /** Dependencies to remove from package.json */
  dependenciesToRemove: string[];
  /** Plugins to remove from app.json */
  pluginsToRemove: (string | object)[];
  /** Providers to remove from root layout */
  providersToRemove: string[];
  /** Contexts to remove (affects AdsContext dependency) */
  contextsToRemove: string[];
}
