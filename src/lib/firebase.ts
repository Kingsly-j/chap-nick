import { getApp, getApps, initializeApp } from 'firebase/app';
import type { Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error('Firebase configuration is missing. Copy .env.local.example to .env.local.');
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let analyticsPromise: Promise<Analytics | null> | undefined;

export function initializeFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const app = getFirebaseApp();
  if (!firebaseConfig.measurementId) return Promise.resolve(null);
  analyticsPromise ??= import('firebase/analytics').then(async ({ getAnalytics, isSupported }) => {
    return await isSupported() ? getAnalytics(app) : null;
  }).catch(error => {
    analyticsPromise = undefined;
    throw error;
  });
  return analyticsPromise;
}
