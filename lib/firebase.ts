import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth: any = null;
let db: any = null;

try {
  if (firebaseConfig.apiKey) {
    // Standard singleton pattern for Firebase initialization in web environments
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("✅ Firebase services initialized successfully");
    console.log("   - Auth Domain:", firebaseConfig.authDomain);
    console.log("   - Project ID:", firebaseConfig.projectId);
  } else {
    console.warn("⚠️ Firebase configuration missing: VITE_FIREBASE_API_KEY is undefined.");
    console.warn("   App will run in MOCK MODE (LocalStorage only).");
  }
} catch (error) {
  console.error("❌ Firebase initialization FAILED:", error);
  console.error("   App falling back to MOCK MODE.");
}

export { auth, db };