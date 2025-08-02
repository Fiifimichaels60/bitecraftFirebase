

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Category } from '@/types';
import { logActivity } from './activityLogService';

const categoriesCollection = collection(db, 'categories');

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function addCategory(categoryName: string, adminEmail?: string): Promise<void> {
  await addDoc(categoriesCollection, { name: categoryName });
  await logActivity('admin_action', `Created category: "${categoryName}"`, { adminEmail });
}

export async function updateCategory(id: string, name: string, adminEmail?: string): Promise<void> {
  const categoryDoc = doc(db, 'categories', id);
  await updateDoc(categoryDoc, { name });
  await logActivity('admin_action', `Updated category: "${name}"`, { categoryId: id, adminEmail });
}

export async function deleteCategory(id: string, adminEmail?: string): Promise<void> {
    const categoryDoc = doc(db, 'categories', id);
    await deleteDoc(categoryDoc);
    await logActivity('admin_action', `Deleted a category`, { categoryId: id, adminEmail });
}
