
'use server';

import { getAuth } from 'firebase-admin/auth';
import { adminApp, adminDb } from './firebase-admin';
import * as admin from 'firebase-admin';

/**
 * Sets a custom claim on a Firebase user to identify them as an admin.
 * This should only be called from a trusted server environment.
 * @param uid The UID of the user to make an admin.
 */
export async function setAdminClaim(uid: string): Promise<void> {
  if (!adminApp) throw new Error('Firebase Admin SDK not initialized.');
  const auth = getAuth(adminApp);
  await auth.setCustomUserClaims(uid, { isAdmin: true });
  console.log(`Custom claim set for user: ${uid}`);
}

export async function updateUserEmail(uid: string, email: string): Promise<void> {
    if (!adminApp) throw new Error('Firebase Admin SDK not initialized.');
    const auth = getAuth(adminApp);
    await auth.updateUser(uid, { email });
    console.log(`Email updated for user: ${uid}`);
}

export async function updateUserPassword(uid: string, password: string): Promise<void> {
    if (!adminApp) throw new Error('Firebase Admin SDK not initialized.');
    const auth = getAuth(adminApp);
    await auth.updateUser(uid, { password });
    console.log(`Password updated for user: ${uid}`);
}

export async function updateUserProfilePicture(uid: string, file: File): Promise<void> {
    if (!adminApp) throw new Error('Firebase Admin SDK not initialized.');
    const auth = getAuth(adminApp);
    const bucket = admin.storage().bucket('gs://nanafood-d8bef.appspot.com');
    const filePath = `profile-pictures/${uid}/${Date.now()}_${file.name}`;
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const blob = bucket.file(filePath);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.type,
        },
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
            console.error('Blob stream error:', err);
            reject('Failed to upload file.');
        });

        blobStream.on('finish', async () => {
            try {
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
                await auth.updateUser(uid, { photoURL: publicUrl });
                console.log(`Profile picture updated for user: ${uid} to ${publicUrl}`);
                resolve();
            } catch (updateError) {
                console.error('Error setting photoURL or making file public:', updateError);
                reject('Failed to finalize profile picture update.');
            }
        });

        blobStream.end(buffer);
    });
}

/**
 * Gets a document from Firestore using the Admin SDK.
 * @param collectionPath The path to the collection.
 * @param documentId The ID of the document.
 * @returns The document data or null if it doesn't exist.
 */
export async function getDocument(collectionPath: string, documentId: string): Promise<FirebaseFirestore.DocumentData | null> {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized. Cannot fetch document.');
    }
    try {
      const docRef = adminDb.collection(collectionPath).doc(documentId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        return docSnap.data()!;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get document '${documentId}' from '${collectionPath}':`, error);
      throw new Error(`Could not load document from ${collectionPath}`);
    }
}
