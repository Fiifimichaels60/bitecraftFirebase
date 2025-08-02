
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { ActivityLog } from '@/types';

const activityLogsCollection = collection(db, 'activityLogs');

/**
 * Logs an activity to the database.
 * @param action The type of action being logged.
 * @param description A human-readable description of the activity.
 * @param details Optional additional data about the event.
 */
export async function logActivity(
    action: ActivityLog['action'], 
    description: string, 
    details?: Record<string, any>
): Promise<void> {
  try {
    await addDoc(activityLogsCollection, {
      action,
      description,
      details: details || {},
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Depending on requirements, you might want to handle this more gracefully
  }
}

/**
 * Fetches the most recent activity logs.
 * @param count The number of logs to fetch.
 * @returns A promise that resolves to an array of activity logs.
 */
export async function getActivityLogs(count: number = 50): Promise<ActivityLog[]> {
    const q = query(activityLogsCollection, orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
        } as ActivityLog;
    });
}
