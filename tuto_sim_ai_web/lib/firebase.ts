'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase 초기화
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth 초기화 및 지속성 설정을 Promise로 감싸기
const initAuth = async (): Promise<Auth> => {
  const auth = getAuth(app);
  await setPersistence(auth, browserLocalPersistence);
  return auth;
};

// Auth 인스턴스 초기화
export const auth = getAuth(app);

// 초기화 즉시 실행
initAuth().catch(console.error);

// Firestore 인스턴스 가져오기
export const db = getFirestore(app);

// Storage 초기화
const storage = getStorage(app);

// Analytics는 클라이언트 사이드에서만 초기화하고, 개발 환경에서는 비활성화
let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { storage, analytics };
export default app; 