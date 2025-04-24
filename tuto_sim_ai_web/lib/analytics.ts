import { getAnalytics, logEvent, setUserProperties } from 'firebase/analytics';
import { app } from '../config/firebase';

// Analytics 인스턴스 초기화
const analytics = getAnalytics(app);

// 사용자 이벤트 타입 정의
export type AnalyticsEventType = 
  | 'lecture_start'
  | 'lecture_complete'
  | 'feedback_received'
  | 'student_created'
  | 'material_upload'
  | 'search_performed'
  | 'error_occurred';

// 사용자 속성 타입 정의
export interface UserProperties {
  userRole?: 'teacher' | 'admin';
  preferredSubjects?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  activeStudents?: number;
}

// 이벤트 로깅 함수
export const logAnalyticsEvent = (
  eventName: AnalyticsEventType,
  eventParams?: Record<string, any>
) => {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Analytics event logging failed:', error);
  }
};

// 사용자 속성 설정 함수
export const setAnalyticsUserProperties = (properties: UserProperties) => {
  try {
    Object.entries(properties).forEach(([key, value]) => {
      setUserProperties(analytics, { [key]: value });
    });
  } catch (error) {
    console.error('Setting user properties failed:', error);
  }
};

// 전환 이벤트 로깅
export const logConversion = (
  conversionName: string,
  value?: number,
  currency?: string
) => {
  try {
    logEvent(analytics, conversionName, {
      value,
      currency,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Conversion logging failed:', error);
  }
};

// 에러 이벤트 로깅
export const logError = (
  errorCode: string,
  errorMessage: string,
  errorContext?: Record<string, any>
) => {
  try {
    logEvent(analytics, 'error_occurred', {
      error_code: errorCode,
      error_message: errorMessage,
      error_context: errorContext,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error logging failed:', error);
  }
}; 