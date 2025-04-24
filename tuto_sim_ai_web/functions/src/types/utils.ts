import { Timestamp } from 'firebase-admin/firestore';

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  limit: number;
  startAfter?: Timestamp;
}

// 쿼리 필터 타입
export interface QueryFilter {
  field: string;
  operator: '<' | '<=' | '==' | '>=' | '>' | '!=';
  value: any;
}

// 정렬 타입
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// AI 응답 타입
export interface AIResponse {
  text: string;
  confidence: number;
  timestamp: Timestamp;
}

// 에러 타입
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 검증 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
} 