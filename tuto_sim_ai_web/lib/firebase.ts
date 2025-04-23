'use client';

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAeFZdIYCNx-oJjwz5HmmT41h4u6HO6ML0",
  authDomain: "tutosimai.firebaseapp.com",
  projectId: "tutosimai",
  storageBucket: "tutosimai.appspot.com",
  messagingSenderId: "121993803860",
  appId: "1:121993803860:web:74debfcd3597186ccc95c1",
  measurementId: "G-G1T4RWFGWF"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth 초기화 및 지속성 설정을 Promise로 감싸기
const initAuth = async (): Promise<Auth> => {
  const auth = getAuth(app);
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('✅ Firebase 인증 지속성이 LOCAL로 설정되었습니다.');
    return auth;
  } catch (error) {
    console.error('❌ Firebase 인증 지속성 설정 오류:', error);
    throw error;
  }
};

// Auth 인스턴스 초기화
export const auth = getAuth(app);

// 초기화 즉시 실행
initAuth().catch(console.error);

// Firestore 인스턴스 가져오기
export const db = getFirestore(app);

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