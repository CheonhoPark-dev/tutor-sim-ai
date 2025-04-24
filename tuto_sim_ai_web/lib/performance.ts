import React, { ComponentType } from 'react';
import { FirebasePerformance, getPerformance, PerformanceTrace, trace } from 'firebase/performance';
import { app } from '../config/firebase';

// Performance Monitoring 인스턴스 초기화
const performance = getPerformance(app);

// 커스텀 트레이스 타입 정의
export type CustomTraceType = 
  | 'api_call_test'
  | 'data_processing_test'
  | 'image_load_test'
  | 'lecture_load'
  | 'student_profile_load'
  | 'feedback_generation'
  | 'material_upload'
  | 'search_execution';

interface TraceMetadata {
  testType?: 'api' | 'processing' | 'resource';
  [key: string]: any;
}

// 커스텀 트레이스 시작
export const startCustomTrace = async (
  traceName: CustomTraceType,
  attributes?: Record<string, string>
): Promise<PerformanceTrace | null> => {
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
export const stopCustomTrace = (customTrace: PerformanceTrace | null) => {
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
  customTrace: PerformanceTrace | null,
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
export async function measureAsyncOperation<T>(
  traceName: CustomTraceType,
  operation: () => Promise<T>,
  metadata?: TraceMetadata
): Promise<T> {
  const customTrace = trace(performance, traceName);
  
  // 메타데이터 추가
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      if (typeof value === 'string') {
        customTrace.putAttribute(key, value);
      } else if (typeof value === 'number') {
        customTrace.putMetric(key, value);
      }
    });
  }

  try {
    customTrace.start();
    const result = await operation();
    return result;
  } finally {
    customTrace.stop();
  }
}

// 자동 성능 추적 HOC
export function withPerformanceTracking<P extends object>(
  traceName: CustomTraceType,
  attributes?: Record<string, string>
): (WrappedComponent: ComponentType<P>) => React.FC<P> {
  return (WrappedComponent: ComponentType<P>) => {
    const PerformanceTrackedComponent: React.FC<P> = (props) => {
      React.useEffect(() => {
        const tracePromise = startCustomTrace(traceName, attributes);
        return () => {
          tracePromise.then(trace => stopCustomTrace(trace));
        };
      }, []);

      return React.createElement(WrappedComponent, props);
    };
    
    return PerformanceTrackedComponent;
  };
} 