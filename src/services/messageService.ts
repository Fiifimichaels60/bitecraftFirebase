
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import type { Message } from '@/types';
import { logActivity } from './activityLogService';

const messagesCollection = collection(db, 'messages');

export async function addMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
  await addDoc(messagesCollection, {
    ...messageData,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

export async function getMessages(): Promise<Message[]> {
  const q = query(messagesCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as Message;
  });
}

export async function updateMessageStatus(id: string, isRead: boolean, adminEmail?: string): Promise<void> {
  const messageDoc = doc(db, 'messages', id);
  await updateDoc(messageDoc, { isRead });
  const action = isRead ? 'Marked message as read' : 'Marked message as unread';
  await logActivity('admin_action', action, { messageId: id, adminEmail });
}

export async function deleteMessage(id: string, adminEmail?: string): Promise<void> {
  const messageDoc = doc(db, 'messages', id);
  await deleteDoc(messageDoc);
  await logActivity('admin_action', 'Deleted a message', { messageId: id, adminEmail });
}
