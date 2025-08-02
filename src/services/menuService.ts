

import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { FoodItem } from '@/types';
import { logActivity } from './activityLogService';

const menuItemsCollection = collection(db, 'menuItems');

export async function getMenuItems(): Promise<FoodItem[]> {
  const snapshot = await getDocs(menuItemsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem));
}

export async function addMenuItem(item: Omit<FoodItem, 'id' | 'image'>, image: File | string, adminEmail?: string): Promise<void> {
  let imageURL: string;

  if (typeof image === 'string') {
    imageURL = image;
  } else {
    imageURL = await uploadImage(image);
  }
  
  const docRef = await addDoc(menuItemsCollection, { ...item, image: imageURL });
  await logActivity('admin_action', `Added menu item: "${item.name}"`, { menuItemId: docRef.id, adminEmail });
}

export async function updateMenuItem(id: string, item: Omit<FoodItem, 'id' | 'image'>, adminEmail?: string, image?: File | string): Promise<void> {
    const menuItemDoc = doc(db, 'menuItems', id);
    let imageURL;

    if (image) {
        if (typeof image === 'string') {
            imageURL = image;
        } else {
            imageURL = await uploadImage(image);
        }
        await updateDoc(menuItemDoc, { ...item, image: imageURL });
    } else {
        await updateDoc(menuItemDoc, item);
    }
    await logActivity('admin_action', `Updated menu item: "${item.name}"`, { menuItemId: id, adminEmail });
}

export async function deleteMenuItem(id: string, imageUrl: string, adminEmail?: string): Promise<void> {
    const menuItemDoc = doc(db, 'menuItems', id);
    await deleteDoc(menuItemDoc);

    // Optional: Delete the image from storage if it's a firebase storage URL
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        } catch (error) {
            console.error("Failed to delete image from storage:", error);
        }
    }
    await logActivity('admin_action', `Deleted a menu item`, { menuItemId: id, adminEmail });
}


async function uploadImage(imageFile: File): Promise<string> {
    const storageRef = ref(storage, `menu_items/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}
