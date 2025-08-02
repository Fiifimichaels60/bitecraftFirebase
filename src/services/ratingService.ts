
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import type { Rating } from '@/types';
import { logActivity } from './activityLogService';

const ratingsCollection = collection(db, 'ratings');

export async function addRating(ratingData: { rating: number; comment?: string }): Promise<void> {
  await addDoc(ratingsCollection, {
    ...ratingData,
    createdAt: serverTimestamp(),
  });
}

export async function getRatings(): Promise<Rating[]> {
  const q = query(ratingsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as Rating;
  });
}

export async function deleteRating(id: string, adminEmail?: string): Promise<void> {
    const ratingDoc = doc(db, 'ratings', id);
    await deleteDoc(ratingDoc);
    await logActivity('admin_action', `Deleted a rating`, { ratingId: id, adminEmail });
}
