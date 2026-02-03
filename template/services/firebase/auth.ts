/**
 * Firebase Authentication Service
 * Handles anonymous authentication and user state management
 */

import {
  getAuth,
  signInAnonymously as firebaseSignInAnonymously,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  getIdToken as firebaseGetIdToken,
} from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FIREBASE_CONFIG } from '../../config/features';
import type { FirebaseUser } from './types';

// Auth instance cache
let authInstance: FirebaseAuthTypes.Module | null = null;

/**
 * Get or create auth instance
 */
function getAuthInstance(): FirebaseAuthTypes.Module {
  if (!authInstance) {
    authInstance = getAuth();
  }
  return authInstance;
}

// Current user state
let currentUser: FirebaseUser | null = null;
let authUnsubscribe: (() => void) | null = null;

/**
 * Initialize Firebase Authentication
 * Sets up auth state listener and persists user data
 */
export function initAuth(): void {
  if (!FIREBASE_CONFIG.ENABLE_FIREBASE || !FIREBASE_CONFIG.ENABLE_FIRESTORE) {
    console.log('[Firebase Auth] Disabled via feature flag');
    return;
  }

  // Clean up existing listener if any
  if (authUnsubscribe) {
    authUnsubscribe();
  }

  // Set up auth state listener using the modular API
  const auth = getAuthInstance();
  authUnsubscribe = firebaseOnAuthStateChanged(auth, (user: FirebaseAuthTypes.User | null) => {
    if (user) {
      currentUser = {
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous,
      };

      // Persist UID to localStorage
      try {
        globalThis.localStorage?.setItem('firebase_uid', user.uid);
      } catch (e) {
        console.warn('[Firebase Auth] Failed to persist UID:', e);
      }

      console.log('[Firebase Auth] User signed in:', currentUser.uid);
    } else {
      currentUser = null;
      console.log('[Firebase Auth] User signed out');
    }
  });
}

/**
 * Sign in anonymously
 * Creates a new anonymous user or returns existing one
 */
export async function signInAnonymously(): Promise<FirebaseUser | null> {
  if (!FIREBASE_CONFIG.ENABLE_FIREBASE || !FIREBASE_CONFIG.ENABLE_FIRESTORE) {
    console.log('[Firebase Auth] Anonymous Auth is disabled');
    return null;
  }

  try {
    const auth = getAuthInstance();
    const result = await firebaseSignInAnonymously(auth);
    const user = result.user;

    const firebaseUser: FirebaseUser = {
      uid: user.uid,
      email: user.email,
      isAnonymous: user.isAnonymous,
    };

    console.log('[Firebase Auth] Signed in anonymously:', firebaseUser.uid);
    return firebaseUser;
  } catch (error: any) {
    console.error('[Firebase Auth] Anonymous auth failed:', error);

    // Handle specific error codes
    if (error.code === 'auth/operation-not-allowed') {
      console.error('[Firebase Auth] Enable anonymous in your Firebase console.');
    }

    return null;
  }
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  return currentUser;
}

/**
 * Get the current user's UID
 */
export function getUserId(): string | null {
  const auth = getAuthInstance();
  return currentUser?.uid || auth.currentUser?.uid || null;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  if (!FIREBASE_CONFIG.ENABLE_FIREBASE) {
    console.log('[Firebase Auth] Sign out disabled');
    return;
  }

  try {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
    console.log('[Firebase Auth] User signed out');
  } catch (error) {
    console.error('[Firebase Auth] Sign out failed:', error);
    throw error;
  }
}

/**
 * Subscribe to auth state changes
 * Returns an unsubscribe function
 */
export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): () => void {
  if (!FIREBASE_CONFIG.ENABLE_FIREBASE || !FIREBASE_CONFIG.ENABLE_FIRESTORE) {
    return () => {}; // No-op unsubscribe
  }

  const auth = getAuthInstance();
  const unsubscribe = firebaseOnAuthStateChanged(auth, (user: FirebaseAuthTypes.User | null) => {
    const firebaseUser = user
      ? {
          uid: user.uid,
          email: user.email,
          isAnonymous: user.isAnonymous,
        }
      : null;
    callback(firebaseUser);
  });

  return unsubscribe;
}

/**
 * Check if a user is currently signed in
 */
export function isUserSignedIn(): boolean {
  const auth = getAuthInstance();
  return auth.currentUser !== null || currentUser !== null;
}

/**
 * Get the current user's ID token (for backend authentication)
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (!FIREBASE_CONFIG.ENABLE_FIREBASE) {
    return null;
  }

  const auth = getAuthInstance();
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    const idTokenResult = await firebaseGetIdToken(user, forceRefresh);
    return idTokenResult;
  } catch (error) {
    console.error('[Firebase Auth] Failed to get ID token:', error);
    return null;
  }
}

/**
 * Clean up auth state listener
 * Call this when the app is shutting down
 */
export function cleanupAuth(): void {
  if (authUnsubscribe) {
    authUnsubscribe();
    authUnsubscribe = null;
  }
}
