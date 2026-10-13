import 'server-only';

import { applicationDefault, cert, getApps, initializeApp, type Credential } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export function getFirebaseAdminApp() {
  const existing = getApps().find(app => app.name === 'chap-nick-admin');
  const serviceAccountBase64 = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64;
  let credential: Credential;
  if (serviceAccountBase64) {
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
    if (serviceAccount.project_id !== process.env.FIREBASE_ADMIN_PROJECT_ID) {
      throw new Error('Firebase Admin service account project does not match FIREBASE_ADMIN_PROJECT_ID.');
    }
    credential = cert(serviceAccount);
  } else {
    credential = applicationDefault();
  }
  return existing ?? initializeApp({
    credential,
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET,
  }, 'chap-nick-admin');
}

export const getAdminAuth = () => getAuth(getFirebaseAdminApp());
export const getAdminFirestore = () => getFirestore(getFirebaseAdminApp());
export const getAdminStorage = () => getStorage(getFirebaseAdminApp());
