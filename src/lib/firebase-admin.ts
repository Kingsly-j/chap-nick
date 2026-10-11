import 'server-only';

import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export function getFirebaseAdminApp() {
  const existing = getApps().find(app => app.name === 'chap-nick-admin');
  return existing ?? initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET,
  }, 'chap-nick-admin');
}

export const getAdminAuth = () => getAuth(getFirebaseAdminApp());
export const getAdminFirestore = () => getFirestore(getFirebaseAdminApp());
export const getAdminStorage = () => getStorage(getFirebaseAdminApp());
