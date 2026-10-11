'use client';

import { useEffect } from 'react';
import { initializeFirebaseAnalytics } from '@/lib/firebase';

export default function FirebaseProvider() {
  useEffect(() => {
    void initializeFirebaseAnalytics().catch(error => {
      console.warn('Firebase Analytics could not be initialized:', error);
    });
  }, []);
  return null;
}
