/**
 * Feature Flags Configuration
 *
 * Firebase and related services can be enabled/disabled via:
 * 1. Expo extra config in app.json (recommended)
 * 2. Environment variables in app.config.js
 *
 * When disabled, all Firebase operations become safe no-ops.
 */

import Constants from 'expo-constants';

// Read from Expo extra config (set in app.json) or environment
const ENABLE_FIREBASE = Constants.expoConfig?.extra?.ENABLE_FIREBASE === true || process.env.ENABLE_FIREBASE === 'true' || false;
const ENABLE_FIRESTORE = Constants.expoConfig?.extra?.ENABLE_FIRESTORE === true || process.env.ENABLE_FIRESTORE === 'true' || false;
const ENABLE_ANALYTICS = Constants.expoConfig?.extra?.ENABLE_ANALYTICS === true || process.env.ENABLE_ANALYTICS === 'true' || false;

export const FIREBASE_CONFIG = {
  ENABLE_FIREBASE,
  ENABLE_FIRESTORE: ENABLE_FIREBASE && ENABLE_FIRESTORE,
  ENABLE_ANALYTICS: ENABLE_FIREBASE && ENABLE_ANALYTICS,
  // Firebase config files (google-services.json and GoogleService-Info.plist) are used for the actual API keys
} as const;

export type FirebaseConfig = typeof FIREBASE_CONFIG;
