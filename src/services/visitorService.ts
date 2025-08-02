
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc, doc, orderBy } from 'firebase/firestore';
import type { Visitor } from '@/types';
import { logActivity } from './activityLogService';


const visitorsCollection = collection(db, 'visitors');

/**
 * Normalizes a Ghanaian phone number to the format '233...'.
 * @param phone The phone number to normalize.
 * @returns The normalized phone number.
 */
function normalizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\s+/g, ''); // Remove spaces
    if (cleaned.startsWith('+233')) {
        return cleaned.substring(1);
    }
    if (cleaned.startsWith('0')) {
        return '233' + cleaned.substring(1);
    }
    return cleaned; // Assumes it's already in 233... format
}

/**
 * Adds a visitor to the database if they don't already exist based on their phone number.
 * @param visitorData The visitor's details (name, phone, email).
 */
export async function addVisitorIfNotExists(visitorData: { name: string; phone: string; email: string }): Promise<void> {
    const { name, phone, email } = visitorData;

    if (!phone) {
        console.warn("Visitor's phone number is missing, skipping.");
        return;
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    try {
        const q = query(visitorsCollection, where("phone", "==", normalizedPhone));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Visitor does not exist, add them
            await addDoc(visitorsCollection, {
                name,
                phone: normalizedPhone,
                email,
                createdAt: serverTimestamp(),
            });
            console.log(`New visitor added: ${name} (${normalizedPhone})`);
        } else {
            // Visitor already exists, do nothing
            console.log(`Visitor with phone ${normalizedPhone} already exists.`);
        }
    } catch (error) {
        console.error("Error adding or checking visitor:", error);
        // We don't throw the error to avoid breaking the checkout flow
    }
}


export async function getVisitors(): Promise<Visitor[]> {
    const q = query(visitorsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
      } as Visitor;
    });
}
  
export async function deleteVisitor(id: string, adminEmail?: string): Promise<void> {
    const visitorDoc = doc(db, 'visitors', id);
    await deleteDoc(visitorDoc);
    await logActivity('admin_action', `Deleted a visitor`, { visitorId: id, adminEmail });
}
