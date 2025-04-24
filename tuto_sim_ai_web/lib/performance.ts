import React, { ComponentType } from 'react';
import { getPerformance, trace } from 'firebase/performance';
import { app } from '../config/firebase';

// Performance Monitoring 인스턴스 초기화
const performance = getPerformance(app);

// 커스텀 트레이스 타입 정의
export type CustomTraceType = 
  | 'lecture_load'
  | 'student_profile_load'
  | 'feedback_generation'
  | 'material_upload'
  | 'search_execution';

// 커스텀 트레이스 시작
export const startCustomTrace = async (
  traceName: CustomTraceType,
  attributes?: Record<string, string>
) => {
  try {
    const customTrace = trace(performance, traceName);
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        customTrace.putAttribute(key, value);
      });
    }
    
    customTrace.start();
    return customTrace;
  } catch (error) {
    console.error('Starting custom trace failed:', error);
    return null;
  }
};

// 커스텀 트레이스 종료
export const stopCustomTrace = (customTrace: any) => {
  try {
    if (customTrace) {
      customTrace.stop();
    }
  } catch (error) {
    console.error('Stopping custom trace failed:', error);
  }
};

// 메트릭 기록
export const recordMetric = (
  customTrace: any,
  metricName: string,
  value: number
) => {
  try {
    if (customTrace) {
      customTrace.putMetric(metricName, value);
    }
  } catch (error) {
    console.error('Recording metric failed:', error);
  }
};

// 성능 모니터링 유틸리티
export const measureAsyncOperation = async <T>(
  traceName: CustomTraceType,
  operation: () => Promise<T>,
  attributes?: Record<string, string>
): Promise<T> => {
  const customTrace = await startCustomTrace(traceName, attributes);
  
  try {
    const result = await operation();
    return result;
  } finally {
    stopCustomTrace(customTrace);
  }
};

// 자동 성능 추적 HOC
export const withPerformanceTracking = (
  traceName: CustomTraceType,
  attributes?: Record<string, string>
) => {
  return (WrappedComponent: ComponentType<any>) => {
    return function PerformanceTrackedComponent(props: any) {
      React.useEffect(() => {
        const trace = startCustomTrace(traceName, attributes);
        return () => stopCustomTrace(trace);
      }, []);

      return <WrappedComponent {...props} />;
    };
  };
}; 