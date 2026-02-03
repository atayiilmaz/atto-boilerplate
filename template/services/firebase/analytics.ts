/**
 * Firebase Analytics Service
 * Handles all Analytics event logging and user property management
 */

import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperty as firebaseSetUserProperty,
  logAppOpen as firebaseLogAppOpen,
  logScreenView as firebaseLogScreenView,
  getAppInstanceId as firebaseGetAppInstanceId,
  resetAnalyticsData as firebaseResetAnalyticsData,
  setAnalyticsCollectionEnabled as firebaseSetAnalyticsCollectionEnabled,
  setConsent as firebaseSetConsent,
  logPurchase,
  logSearch,
  logSelectContent,
  logSetCheckoutOption,
  logShare,
  logSignUp,
  logViewItem,
  logViewItemList,
} from '@react-native-firebase/analytics';
import { FIREBASE_CONFIG } from '../../config/features';

// Analytics instance cache
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

/**
 * Get or create analytics instance
 */
function getAnalyticsInstance() {
  if (!analyticsInstance) {
    analyticsInstance = getAnalytics();
  }
  return analyticsInstance;
}

/**
 * Check if Analytics is enabled
 */
function isAnalyticsEnabled(): boolean {
  return FIREBASE_CONFIG.ENABLE_FIREBASE && FIREBASE_CONFIG.ENABLE_ANALYTICS;
}

/**
 * Log a custom analytics event
 * @param name - Event name (max 40 characters, alphanumeric & underscore)
 * @param params - Event parameters (optional)
 */
export function logEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (!isAnalyticsEnabled()) {
    // No-op when disabled
    return;
  }

  // Reserved event names that cannot be used
  const reservedEvents = [
    'ad_activeview',
    'ad_click',
    'ad_exposure',
    'ad_impression',
    'ad_query',
    'ad_reward',
    'adunit_exposure',
    'app_background',
    'app_clear_data',
    'app_remove',
    'app_store_refund',
    'app_store_subscription_cancel',
    'app_store_subscription_convert',
    'app_store_subscription_renew',
    'app_update',
    'app_upgrade',
    'dynamic_link_app_open',
    'dynamic_link_app_update',
    'dynamic_link_first_open',
    'error',
    'first_open',
    'first_visit',
    'in_app_purchase',
    'notification_dismiss',
    'notification_foreground',
    'notification_open',
    'notification_receive',
    'os_update',
    'session_start',
    'session_start_with_rollout',
    'user_engagement',
  ];

  if (reservedEvents.includes(name)) {
    console.warn(`[Firebase Analytics] Event name "${name}" is reserved and cannot be used`);
    return;
  }

  // Filter out undefined values from params
  const cleanParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      )
    : undefined;

  const analytics = getAnalyticsInstance();
  firebaseLogEvent(analytics, name, cleanParams).catch((error: unknown) => {
    // Silently fail - analytics shouldn't break the app
    console.warn('[Firebase Analytics] Log event failed:', error);
  });
}

/**
 * Set the user ID for analytics
 * @param uid - User ID to associate with events
 */
export async function setUserId(uid: string | null): Promise<void> {
  if (!isAnalyticsEnabled()) {
    return;
  }

  const analytics = getAnalyticsInstance();

  if (!uid) {
    console.log('[Firebase Analytics] Clearing user ID');
    await firebaseSetUserId(analytics, null);
    return;
  }

  try {
    await firebaseSetUserId(analytics, uid);
    console.log('[Firebase Analytics] User ID set:', uid);
  } catch (error) {
    console.warn('[Firebase Analytics] Failed to set user ID:', error);
  }
}

/**
 * Set a user property
 * @param name - Property name
 * @param value - Property value
 */
export async function setUserProperty(
  name: string,
  value: string | null
): Promise<void> {
  if (!isAnalyticsEnabled()) {
    return;
  }

  try {
    const analytics = getAnalyticsInstance();
    await firebaseSetUserProperty(analytics, name, value);
    console.log(`[Firebase Analytics] User property set: ${name} = ${value}`);
  } catch (error) {
    console.warn('[Firebase Analytics] Failed to set user property:', error);
  }
}

/**
 * Set multiple user properties at once
 * @param properties - Object containing property names and values
 */
export async function setUserProperties(
  properties: Record<string, string | null>
): Promise<void> {
  if (!isAnalyticsEnabled()) {
    return;
  }

  for (const [name, value] of Object.entries(properties)) {
    await setUserProperty(name, value);
  }
}

// ============================================================================
// PREDEFINED ANALYTICS EVENTS
// Common Firebase predefined events with proper typing
// ============================================================================

/**
 * Log E-Commerce purchase event
 */
export function logPurchaseEvent(params: {
  transaction_id?: string;
  affiliation?: string;
  coupon?: string;
  currency?: string;
  value?: number;
  items?: Array<{
    item_id?: string;
    item_name?: string;
    item_category?: string;
    quantity?: number;
    price?: number;
  }>;
}): void {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  logPurchase(analytics, params);
}

/**
 * Log search event
 */
export function logSearchEvent(params: {
  search_term: string;
  number_of_nights?: number;
  number_of_rooms?: number;
  number_of_passengers?: number;
  origin?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  travel_class?: string;
}): void {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  logSearch(analytics, params);
}

/**
 * Log select content event
 */
export function logSelectContentEvent(params: {
  content_type: string;
  item_id: string;
}): void {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  logSelectContent(analytics, params);
}

/**
 * Log set checkout option event
 */
export function logSetCheckoutOptionEvent(params: {
  checkout_step: number;
  checkout_option: string;
  value?: number;
}): void {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  logSetCheckoutOption(analytics, params);
}

/**
 * Log share event
 */
export function logShareEvent(params: {
  content_type: string;
  item_id: string;
  method: string;
}): void {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  logShare(analytics, params);
}

/**
 * Log sign up event
 */
export function logSignUpEvent(params: {
  method: string;
}): void {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  logSignUp(analytics, params);
}

/**
 * Log view item event
 */
export function logViewItemEvent(params: {
  items: Array<{
    item_id?: string;
    item_name?: string;
    item_category?: string;
    quantity?: number;
    price?: number;
  }>;
  value?: number;
  currency?: string;
}): void {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  logViewItem(analytics, params);
}

/**
 * Log view item list event
 */
export function logViewItemListEvent(params: {
  items: Array<{
    item_id?: string;
    item_name?: string;
    item_category?: string;
    quantity?: number;
    price?: number;
  }>;
  item_list_name?: string;
  item_list_id?: string;
}): void {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  logViewItemList(analytics, params);
}

/**
 * Log app open event
 */
export async function logAppOpen(): Promise<void> {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  await firebaseLogAppOpen(analytics);
}

/**
 * Log screen view event
 * @param screenName - Screen name
 * @param screenClassOverride - Optional screen class override
 */
export async function logScreenView(
  screenName: string,
  screenClassOverride?: string
): Promise<void> {
  if (!isAnalyticsEnabled()) return;
  const analytics = getAnalyticsInstance();
  await firebaseLogScreenView(analytics, {
    screen_name: screenName,
    screen_class: screenClassOverride,
  });
}

/**
 * Get the app instance ID
 * @returns App instance ID or null if Analytics is disabled
 */
export async function getAppInstanceId(): Promise<string | null> {
  if (!isAnalyticsEnabled()) {
    return null;
  }

  try {
    const analytics = getAnalyticsInstance();
    return await firebaseGetAppInstanceId(analytics);
  } catch (error) {
    console.warn('[Firebase Analytics] Failed to get app instance ID:', error);
    return null;
  }
}

/**
 * Reset analytics data
 * Useful for testing or when user logs out
 */
export async function resetAnalyticsData(): Promise<void> {
  if (!isAnalyticsEnabled()) {
    return;
  }

  try {
    const analytics = getAnalyticsInstance();
    await firebaseResetAnalyticsData(analytics);
    console.log('[Firebase Analytics] Data reset');
  } catch (error) {
    console.warn('[Firebase Analytics] Failed to reset:', error);
  }
}

/**
 * Alias for resetAnalyticsData for backward compatibility
 */
export const resetAnalytics = resetAnalyticsData;

/**
 * Set analytics collection enabled
 * @param enabled - Whether to enable analytics collection
 */
export async function setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
  if (!isAnalyticsEnabled()) {
    return;
  }

  try {
    const analytics = getAnalyticsInstance();
    await firebaseSetAnalyticsCollectionEnabled(analytics, enabled);
    console.log(`[Firebase Analytics] Collection ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.warn('[Firebase Analytics] Failed to set collection enabled:', error);
  }
}

/**
 * Set consent status
 * @param consentSettings - Consent settings for different data types
 */
export async function setConsent(consentSettings: {
  analyticsStorage?: boolean;
  adStorage?: boolean;
  adUserData?: boolean;
  adPersonalization?: boolean;
}): Promise<void> {
  if (!isAnalyticsEnabled()) {
    return;
  }

  try {
    const analytics = getAnalyticsInstance();
    await firebaseSetConsent(analytics, consentSettings);
    console.log('[Firebase Analytics] Consent set:', consentSettings);
  } catch (error) {
    console.warn('[Firebase Analytics] Failed to set consent:', error);
  }
}
