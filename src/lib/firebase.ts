
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { seedDatabase } from "./data";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_VE-O_RDEYWRmSRaOgdi58-aNt6me6ik",
  authDomain: "nanafood-d8bef.firebaseapp.com",
  projectId: "nanafood-d8bef",
  storageBucket: "nanafood-d8bef.appspot.com",
  messagingSenderId: "529500904429",
  appId: "1:529500904429:web:2edd8bc0e1b89ea84965e4",
  measurementId: "G-T9Y6VR1DTM"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Attempt to seed the database
if (typeof window === 'undefined') { // Run only on the server
    seedDatabase().catch(console.error);
}


export { app, auth, db, storage };
