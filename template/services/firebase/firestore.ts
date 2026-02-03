/**
 * Firebase Firestore Service
 * Handles all Firestore database operations
 */

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  addDoc,
  batch,
  runTransaction,
} from '@react-native-firebase/firestore';
import type { FirestoreTypes } from '@react-native-firebase/firestore';
import { FIREBASE_CONFIG } from '../../config/features';
import type { FirestoreDocument, UserMetadata } from './types';

// Firestore instance cache
let firestoreInstance: FirestoreTypes.Module | null = null;

/**
 * Get or create firestore instance
 */
function getFirestoreInstance(): FirestoreTypes.Module {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore();
  }
  return firestoreInstance;
}

/**
 * Helper to create a document reference from a path string
 * The modular API requires path segments as separate arguments
 * Document paths must have an EVEN number of segments (e.g., "users/abc" or "users/abc/profile/default")
 */
function createDocRef(db: FirestoreTypes.Module, path: string) {
  // Split and filter empty segments (handles leading/trailing slashes)
  const segments = path.split('/').filter(Boolean);

  // Validate: document paths must have even number of segments
  // Collections have odd segments, documents have even segments
  if (segments.length % 2 !== 0) {
    const pathDisplay = segments.join('/');
    const suggestion = segments.slice(0, -1).join('/') || 'root';
    throw new Error(
      `[Firestore] Invalid document path: "${pathDisplay}" has ${segments.length} segment(s).\n` +
      `Document paths must have an EVEN number of segments (collections are odd).\n` +
      `Did you mean to use a collection path, or is this a document reference?\n` +
      `Suggestion: If storing a document, use "${suggestion}" or add a document ID like "${pathDisplay}/default"`
    );
  }

  return doc(db, ...segments);
}

/**
 * Helper to create a collection reference from a path string
 * Collection paths must have an ODD number of segments (e.g., "users" or "users/abc/subcollection")
 */
function createColRef(db: FirestoreTypes.Module, path: string) {
  // Split and filter empty segments (handles leading/trailing slashes)
  const segments = path.split('/').filter(Boolean);

  // Validate: collection paths must have odd number of segments
  // Collections have odd segments, documents have even segments
  if (segments.length % 2 === 0) {
    const pathDisplay = segments.join('/');
    const suggestion = segments.length > 0 ? `${pathDisplay}/${segments[segments.length - 1]}s` : 'users';
    throw new Error(
      `[Firestore] Invalid collection path: "${pathDisplay}" has ${segments.length} segment(s).\n` +
      `Collection paths must have an ODD number of segments (documents are even).\n` +
      `Did you mean to use a document path, or is this a collection reference?\n` +
      `Suggestion: Use a proper collection path like "${suggestion}" or use doc() for document paths`
    );
  }

  return collection(db, ...segments);
}

/**
 * Check if Firestore is enabled
 */
function isFirestoreEnabled(): boolean {
  return FIREBASE_CONFIG.ENABLE_FIREBASE && FIREBASE_CONFIG.ENABLE_FIRESTORE;
}

/**
 * Get a document by path
 * @param path - Document path (e.g., 'users/ABC')
 * @returns Document data with id, or null if not found
 */
export async function firestoreGetDoc<T extends Record<string, any>>(
  path: string
): Promise<(T & { id: string }) | null> {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return null;
  }

  try {
    const db = getFirestoreInstance();
    const docRef = createDocRef(db, path);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
    }

    return null;
  } catch (error) {
    console.error(`[Firebase Firestore] Error getting doc at ${path}:`, error);
    return null;
  }
}

/**
 * Set a document (overwrites existing data)
 * @param path - Document path
 * @param data - Document data
 * @param options - Optional merge setting
 */
export async function firestoreSetDoc<T extends Record<string, any>>(
  path: string,
  data: T,
  options?: { merge?: boolean }
): Promise<void> {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return;
  }

  try {
    const db = getFirestoreInstance();
    const docRef = createDocRef(db, path);

    if (options?.merge) {
      await setDoc(docRef, data, { merge: true });
    } else {
      await setDoc(docRef, data);
    }

    console.log(`[Firebase Firestore] Document set at ${path}`);
  } catch (error) {
    console.error(`[Firebase Firestore] Error setting doc at ${path}:`, error);
    throw error;
  }
}

/**
 * Update a document (only updates specified fields)
 * @param path - Document path
 * @param data - Partial data to update
 */
export async function firestoreUpdateDoc(
  path: string,
  data: Partial<Record<string, any>>
): Promise<void> {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return;
  }

  try {
    const db = getFirestoreInstance();
    const docRef = createDocRef(db, path);
    await updateDoc(docRef, data);
    console.log(`[Firebase Firestore] Document updated at ${path}`);
  } catch (error) {
    console.error(`[Firebase Firestore] Error updating doc at ${path}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 * @param path - Document path
 */
export async function firestoreDeleteDoc(path: string): Promise<void> {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return;
  }

  try {
    const db = getFirestoreInstance();
    const docRef = createDocRef(db, path);
    await deleteDoc(docRef);
    console.log(`[Firebase Firestore] Document deleted at ${path}`);
  } catch (error) {
    console.error(`[Firebase Firestore] Error deleting doc at ${path}:`, error);
    throw error;
  }
}

/**
 * Add a document to a collection (auto-generates ID)
 * @param collectionPath - Collection path
 * @param data - Document data
 * @returns New document ID
 */
export async function firestoreAddDoc<T extends Record<string, any>>(
  collectionPath: string,
  data: T
): Promise<string> {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return '';
  }

  try {
    const db = getFirestoreInstance();
    const colRef = createColRef(db, collectionPath);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  } catch (error) {
    console.error(`[Firebase Firestore] Error adding doc to ${collectionPath}:`, error);
    throw error;
  }
}

/**
 * Get all documents from a collection
 * @param collectionPath - Collection path
 * @returns Array of documents with IDs
 */
export async function firestoreGetCollection<T extends Record<string, any>>(
  collectionPath: string
): Promise<(T & { id: string })[]> {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return [];
  }

  try {
    const db = getFirestoreInstance();
    const colRef = createColRef(db, collectionPath);
    const snapshot = await getDocs(colRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (T & { id: string })[];
  } catch (error) {
    console.error(`[Firebase Firestore] Error getting collection ${collectionPath}:`, error);
    return [];
  }
}

/**
 * Query a collection with filters
 * @param collectionPath - Collection path
 * @param fieldName - Field to filter on
 * @param operator - Comparison operator (==, >, <, >=, <=, etc.)
 * @param value - Value to compare against
 * @returns Array of matching documents
 */
export async function firestoreQuery<T extends Record<string, any>>(
  collectionPath: string,
  fieldName: string,
  operator: '==' | '>' | '<' | '>=' | '<=' | '!=' | 'array-contains',
  value: any
): Promise<(T & { id: string })[]> {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return [];
  }

  try {
    const db = getFirestoreInstance();
    const colRef = createColRef(db, collectionPath);
    const q = query(colRef, where(fieldName, operator, value));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (T & { id: string })[];
  } catch (error) {
    console.error(`[Firebase Firestore] Error querying ${collectionPath}:`, error);
    return [];
  }
}

/**
 * Listen to real-time updates on a document
 * @param path - Document path
 * @param onNext - Callback when document changes
 * @param onError - Callback when error occurs
 * @returns Unsubscribe function
 */
export function firestoreOnSnapshotDoc<T extends Record<string, any>>(
  path: string,
  onNext: (doc: (T & { id: string }) | null) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return () => {};
  }

  const db = getFirestoreInstance();
  const docRef = createDocRef(db, path);
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists) {
        onNext({ id: docSnap.id, ...docSnap.data() } as T & { id: string });
      } else {
        onNext(null);
      }
    },
    (error) => {
      console.error(`[Firebase Firestore] Snapshot error for ${path}:`, error);
      onError?.(error);
    }
  );

  return unsubscribe;
}

/**
 * Listen to real-time updates on a collection
 * @param collectionPath - Collection path
 * @param onNext - Callback when collection changes
 * @param onError - Callback when error occurs
 * @returns Unsubscribe function
 */
export function firestoreOnSnapshotCollection<T extends Record<string, any>>(
  collectionPath: string,
  onNext: (docs: (T & { id: string })[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return () => {};
  }

  const db = getFirestoreInstance();
  const colRef = createColRef(db, collectionPath);
  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (T & { id: string })[];
      onNext(docs);
    },
    (error) => {
      console.error(`[Firebase Firestore] Snapshot error for ${collectionPath}:`, error);
      onError?.(error);
    }
  );

  return unsubscribe;
}

/**
 * Batch multiple write operations
 * @param operations - Array of operations to perform
 */
export async function firestoreBatchWrite(
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    path: string;
    data?: Record<string, any>;
  }>
): Promise<void> {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    return;
  }

  try {
    const db = getFirestoreInstance();
    const batchInstance = batch();

    operations.forEach((op) => {
      const docRef = createDocRef(db, op.path);
      switch (op.type) {
        case 'set':
          batchInstance.set(docRef, op.data!);
          break;
        case 'update':
          batchInstance.update(docRef, op.data!);
          break;
        case 'delete':
          batchInstance.delete(docRef);
          break;
      }
    });

    await batchInstance.commit();
    console.log(`[Firebase Firestore] Batch write completed: ${operations.length} operations`);
  } catch (error) {
    console.error('[Firebase Firestore] Batch write failed:', error);
    throw error;
  }
}

/**
 * Run a transaction
 * @param updateFunction - Transaction update function
 */
export async function firestoreTransaction<T>(
  updateFunction: (transaction: any) => Promise<T>
): Promise<T> {
  if (!isFirestoreEnabled()) {
    console.log('[Firebase Firestore] Disabled via feature flag');
    throw new Error('Firestore is disabled');
  }

  try {
    const db = getFirestoreInstance();
    return await runTransaction(db, updateFunction);
  } catch (error) {
    console.error('[Firebase Firestore] Transaction failed:', error);
    throw error;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR USER DATA
// ============================================================================

/**
 * Save user metadata to Firestore
 * Only saves if user is authenticated
 * @param metadata - User metadata (without uid)
 */
export async function saveUserMetadata(
  metadata: Omit<UserMetadata, 'uid'>
): Promise<void> {
  const { getUserId } = require('./auth');
  const uid = getUserId();

  if (!uid) {
    console.log('[Firebase Firestore] No user logged in, skipping metadata save');
    return;
  }

  // Store user document directly at users/{uid}
  // This is simpler and more efficient than using a subcollection
  const userDocRef = `users/${uid}`;
  const data: UserMetadata = {
    uid,
    ...metadata,
  };

  await firestoreSetDoc(userDocRef, data, { merge: true });
}

/**
 * Get user metadata from Firestore
 * @returns User metadata or null
 */
export async function getUserMetadata(): Promise<(UserMetadata & { id: string }) | null> {
  const { getUserId } = require('./auth');
  const uid = getUserId();

  if (!uid) {
    return null;
  }

  return firestoreGetDoc<UserMetadata>(`users/${uid}`);
}
