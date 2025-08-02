
import * as admin from 'firebase-admin';

// This is a workaround to handle JSON parsing of the service account
// when it's passed as a stringified environment variable.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount;

if (serviceAccountString) {
    try {
        serviceAccount = JSON.parse(serviceAccountString);
    } catch (e) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT JSON:", e);
        // Fallback or error handling for when JSON parsing fails
    }
}


if (!admin.apps.length) {
  if (serviceAccount) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized for project:", serviceAccount.project_id);
    } catch(e) {
        console.error("Firebase Admin initialization error:", e);
    }
  } else {
    // Fallback for local development without service account, or if parsing failed
    console.warn("Firebase Admin SDK not initialized. Service Account not found or invalid. Admin features will be disabled.");
  }
}

export const adminApp = admin.apps[0] || null;
export const adminDb = adminApp ? admin.firestore() : null;

    
