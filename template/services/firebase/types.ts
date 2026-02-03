/**
 * Firebase Service Types
 * Shared types used across all Firebase service modules
 */

export interface FirebaseUser {
  uid: string;
  email?: string | null;
  isAnonymous: boolean;
}

export interface FirestoreDocument {
  id: string;
  data: any;
}

export interface UserMetadata {
  uid: string;
  onboardingCompletedAt?: number;
  appVersion: string;
  platform: string;
  firstLaunchAt?: number;
}
