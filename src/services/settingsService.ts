
// services/settingsService.ts

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { AppSettings } from '@/types';
import { logActivity } from './activityLogService';
import { getDocument } from '@/lib/firebase-admin-helper';


// Reference to the single settings document in Firestore
const settingsDocRef = doc(db, 'settings', 'app');

/**
 * Get app settings from Firestore for server-side use.
 * This function uses the Admin SDK and is only safe to call from server components/actions.
 */
export async function getSettingsForServer(): Promise<AppSettings> {
    try {
        const data = await getDocument('settings', 'app');
        return {
            deliveryFee: data?.deliveryFee ?? 0,
            primaryColor: data?.primaryColor ?? '25 87% 54%',
            accentColor: data?.accentColor ?? '39 100% 60%',
            hubtelClientId: data?.hubtelClientId ?? '',
            hubtelClientSecret: data?.hubtelClientSecret ?? '',
            merchantAccountNumber: data?.merchantAccountNumber ?? '',
            sidebarColor: data?.sidebarColor ?? '240 10% 3.9%',
            sidebarAccentColor: data?.sidebarAccentColor ?? '25 87% 54%',
            sidebarPosition: data?.sidebarPosition ?? 'left',
            theme: data?.theme ?? 'system',
        };
    } catch (error) {
        console.error('Failed to fetch settings using Admin SDK:', error);
        throw new Error('Could not load server settings');
    }
}


/**
 * Get app settings from Firestore.
 * Returns default values for missing or undefined fields.
 * This function uses the client-side SDK and is safe to call from client components.
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const docSnap = await getDoc(settingsDocRef);
    const data = docSnap.exists() ? docSnap.data() : {};

    return {
        deliveryFee: data.deliveryFee ?? 0,
        primaryColor: data.primaryColor ?? '25 87% 54%',
        accentColor: data.accentColor ?? '39 100% 60%',
        hubtelClientId: data.hubtelClientId ?? '',
        hubtelClientSecret: data.hubtelClientSecret ?? '',
        merchantAccountNumber: data.merchantAccountNumber ?? '',
        sidebarColor: data.sidebarColor ?? '240 10% 3.9%',
        sidebarAccentColor: data.sidebarAccentColor ?? '25 87% 54%',
        sidebarPosition: data.sidebarPosition ?? 'left',
        theme: data.theme ?? 'system',
    };
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    // Throwing an error here will be caught by the calling component
    throw new Error('Could not load settings');
  }
}

/**
 * Update app settings in Firestore.
 * Creates the document if it doesn't exist.
 * Logs the fields that were updated.
 */
export async function updateSettings(settings: Partial<AppSettings>, adminEmail?: string): Promise<void> {
  try {
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
      await updateDoc(settingsDocRef, settings);
    } else {
      await setDoc(settingsDocRef, settings);
    }

    const updatedFields = Object.keys(settings).join(', ');
    await logActivity(
      'admin_action',
      `Updated app settings: ${updatedFields}`,
      { settings, adminEmail }
    );
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw new Error('Could not update settings');
  }
}
