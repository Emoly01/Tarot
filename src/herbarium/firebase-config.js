// Firebase web config for cross-device sync. These values are not secrets:
// Firebase web keys are public by design, and access is guarded by the
// Firestore rules in /firestore.rules (each person can only touch their own
// book). Values can also come from VITE_FIREBASE_* environment variables.
// While apiKey is empty, sign-in is hidden and the app stays local-only.

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || "",
};
