import React from 'react';
import { app } from '../config/firebase';
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics(app);

// 에러 컨텍스트 타입 정의
interface ErrorContext {
  userId?: string;
  location?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

// 글로벌 에러 핸들러
export const initializeErrorTracking = () => {
  if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
      logErrorToAnalytics('uncaught_exception', message.toString(), {
        source,
        line: lineno,
        column: colno,
        stack: error?.stack
      });
    };

    window.onunhandledrejection = (event) => {
      logErrorToAnalytics('unhandled_promise_rejection', event.reason?.message || 'Unknown Promise Rejection', {
        stack: event.reason?.stack
      });
    };
  }
};

// 에러 로깅 함수
export const logErrorToAnalytics = (
  errorType: string,
  errorMessage: string,
  context?: ErrorContext
) => {
  try {
    logEvent(analytics, 'app_exception', {
      error_type: errorType,
      error_message: errorMessage,
      ...context,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to log error to analytics:', error);
  }
};

// 컴포넌트 에러 바운더리
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logErrorToAnalytics('react_error_boundary', error.message, {
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>문제가 발생했습니다.</h2>
          <p>페이지를 새로고침하거나 나중에 다시 시도해주세요.</p>
        </div>
      );
    }

    return this.props.children;
  }
} 