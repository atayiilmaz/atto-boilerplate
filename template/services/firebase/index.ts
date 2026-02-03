/**
 * Firebase Service Module
 *
 * Provides Firebase functionality with optional feature flags.
 * When disabled, all functions return safe no-ops with correct types.
 *
 * Features:
 * - Anonymous Authentication
 * - Firestore CRUD operations
 * - Analytics logging
 * - Lazy initialization
 * - Safe error handling
 *
 * Modules:
 * - auth: Authentication and user management
 * - firestore: Database operations
 * - analytics: Event logging and user properties
 */

import { FIREBASE_CONFIG } from '../../config/features';
import * as analyticsModule from './analytics';

// ============================================================================
// INITIALIZATION
// ============================================================================

let initPromise: Promise<boolean> | null = null;
let isInitialized = false;

/**
 * Initialize Firebase services
 * This should be called once during app startup
 */
export async function initFirebase(): Promise<boolean> {
  // Return cached promise if already initializing/initialized
  if (initPromise) {
    return initPromise;
  }

  if (!FIREBASE_CONFIG.ENABLE_FIREBASE) {
    console.log('[Firebase] Disabled via feature flag');
    isInitialized = false;
    return false;
  }

  initPromise = (async () => {
    try {
      // Note: With react-native-firebase, the app is automatically initialized
      // from google-services.json (Android) and GoogleService-Info.plist (iOS)
      // We just need to verify the services are available

      // Initialize Auth if enabled
      if (FIREBASE_CONFIG.ENABLE_FIRESTORE) {
        const { initAuth } = await import('./auth');
        initAuth();
        console.log('[Firebase] Auth initialized');
      }

      // Analytics is auto-initialized by react-native-firebase
      if (FIREBASE_CONFIG.ENABLE_ANALYTICS) {
        console.log('[Firebase] Analytics initialized');
      }

      isInitialized = true;
      console.log('[Firebase] All services initialized successfully');
      return true;
    } catch (error) {
      console.error('[Firebase] Initialization failed:', error);
      isInitialized = false;
      return false;
    }
  })();

  return initPromise;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return isInitialized;
}

// ============================================================================
// AUTHENTICATION EXPORTS
// ============================================================================

export {
  signInAnonymously,
  getCurrentUser,
  getUserId,
  signOut,
  onAuthStateChanged,
  isUserSignedIn,
  getIdToken,
  cleanupAuth,
} from './auth';
export type { FirebaseUser } from './types';

// ============================================================================
// FIRESTORE EXPORTS
// ============================================================================

export {
  firestoreGetDoc,
  firestoreSetDoc,
  firestoreUpdateDoc,
  firestoreDeleteDoc,
  firestoreAddDoc,
  firestoreGetCollection,
  firestoreQuery,
  firestoreOnSnapshotDoc,
  firestoreOnSnapshotCollection,
  firestoreBatchWrite,
  firestoreTransaction,
  saveUserMetadata,
  getUserMetadata,
} from './firestore';

// ============================================================================
// ANALYTICS EXPORTS
// ============================================================================

export {
  logEvent,
  setUserId,
  setUserProperty,
  setUserProperties,
  logPurchaseEvent as logPurchase,
  logSearchEvent as logSearch,
  logSelectContentEvent as logSelectContent,
  logSetCheckoutOptionEvent as logSetCheckoutOption,
  logShareEvent as logShare,
  logSignUpEvent as logSignUp,
  logViewItemEvent as logViewItem,
  logViewItemListEvent as logViewItemList,
  logAppOpen,
  logScreenView,
  getAppInstanceId,
  resetAnalyticsData,
  resetAnalytics,
  setAnalyticsCollectionEnabled,
  setConsent,
} from './analytics';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Analytics interface for easy importing
 * Usage: import { firebaseAnalytics } from './firebase';
 *   firebaseAnalytics.logEvent('event_name', { param: 'value' });
 */
export const firebaseAnalytics = {
  logEvent: analyticsModule.logEvent,
  setUserId: analyticsModule.setUserId,
  setUserProperty: analyticsModule.setUserProperty,
  setUserProperties: analyticsModule.setUserProperties,
  logPurchase: analyticsModule.logPurchaseEvent,
  logSearch: analyticsModule.logSearchEvent,
  logSelectContent: analyticsModule.logSelectContentEvent,
  logSetCheckoutOption: analyticsModule.logSetCheckoutOptionEvent,
  logShare: analyticsModule.logShareEvent,
  logSignUp: analyticsModule.logSignUpEvent,
  logViewItem: analyticsModule.logViewItemEvent,
  logViewItemList: analyticsModule.logViewItemListEvent,
  logAppOpen: analyticsModule.logAppOpen,
  logScreenView: analyticsModule.logScreenView,
  getAppInstanceId: analyticsModule.getAppInstanceId,
  resetAnalyticsData: analyticsModule.resetAnalyticsData,
  resetAnalytics: analyticsModule.resetAnalytics,
  setAnalyticsCollectionEnabled: analyticsModule.setAnalyticsCollectionEnabled,
  setConsent: analyticsModule.setConsent,
};

// Re-export types
export type { FirestoreDocument, UserMetadata } from './types';
