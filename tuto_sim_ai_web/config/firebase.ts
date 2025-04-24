import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getPerformance } from 'firebase/performance';
import { 
  getAnalytics, 
  logEvent, 
  Analytics, 
  setAnalyticsCollectionEnabled,
  isSupported
} from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase 앱이 이미 초기화되어 있지 않은 경우에만 초기화
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore 초기화
const db = getFirestore(app);

// Auth 초기화
const auth = getAuth(app);

// Storage 초기화
const storage = getStorage(app);

// Analytics 초기화 및 디버그 모드 활성화
let analytics: Analytics | null = null;

const initializeAnalytics = async () => {
  try {
    if (typeof window !== 'undefined') {
      const isAnalyticsSupported = await isSupported();
      if (isAnalyticsSupported) {
        analytics = getAnalytics(app);
        // 개발 환경에서 디버그 모드 활성화
        if (process.env.NODE_ENV === 'development') {
          setAnalyticsCollectionEnabled(analytics, true);
          window.localStorage.setItem('debug', '*');
        }
        // 초기화 테스트 이벤트
        logEvent(analytics, 'analytics_initialized', {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        });
        console.log('Analytics initialized successfully');
      } else {
        console.warn('Analytics is not supported in this environment');
      }
    }
  } catch (error) {
    console.error('Analytics initialization error:', error);
  }
};

// Analytics 초기화 실행
initializeAnalytics();

// Performance 모니터링 초기화 함수
export const initializePerformance = () => {
  if (typeof window !== 'undefined') {
    try {
      const perf = getPerformance(app);
      console.log('Performance monitoring initialized');
      return perf;
    } catch (error) {
      console.error('Performance initialization error:', error);
      return null;
    }
  }
  return null;
};

// 에러 로깅 함수
export const logError = (error: Error, additionalInfo?: Record<string, string>) => {
  console.log('Attempting to log error:', error.message);
  if (analytics) {
    try {
      // Analytics에 에러 로깅
      logEvent(analytics, 'custom_error', {
        error_type: error.name,
        error_message: error.message,
        error_stack: error.stack,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        environment: process.env.NODE_ENV,
        ...additionalInfo
      });
      console.log('Error event logged successfully');
    } catch (loggingError) {
      console.error('Error logging failed:', loggingError);
    }
  } else {
    console.warn('Analytics is not initialized');
  }
};

// 클라이언트 사이드에서만 오프라인 지원 활성화
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      console.error('Firestore 오프라인 지원 활성화 실패:', err);
      logError(err);
    });
}

export { db, auth, storage, analytics }; 