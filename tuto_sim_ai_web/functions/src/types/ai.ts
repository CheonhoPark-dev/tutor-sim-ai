import { Timestamp } from 'firebase-admin/firestore';

/**
 * AI 모델 설정
 */
export interface AIModelConfig {
  model: string;          // 사용할 모델 이름
  temperature: number;    // 응답의 창의성 수준 (0.0 ~ 1.0)
  maxTokens: number;      // 최대 토큰 수
  topP: number;          // 상위 확률 샘플링
}

// 프롬프트 템플릿 타입
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI 피드백 요청 파라미터
 */
export interface GenerateFeedbackRequest {
  lectureContent: string;
  virtualStudentId: string;
  context?: {
    previousFeedback?: string;
    additionalNotes?: string;
  };
}

// 가상 학생 프로필 타입
export interface VirtualStudentProfile {
  personality: PersonalityTrait[];
  learningStyle: LearningStyle;
  comprehensionLevel: number;
  interests: string[];
  challengeAreas: string[];
}

// 성격 특성 타입
export type PersonalityTrait = 
  | '적극적'
  | '신중한'
  | '분석적'
  | '창의적'
  | '실용적'
  | '질문이 많은'
  | '독립적'
  | '협력적';

// 학습 스타일 타입
export type LearningStyle = 
  | '시각적'
  | '청각적'
  | '읽기/쓰기'
  | '실습';

export type DifficultyLevel = 
  | '초급'
  | '중급'
  | '고급';

/**
 * AI 분석 결과
 */
export interface AIAnalysisResult {
  timestamp: Date;
  modelUsed: string;
  confidenceLevel: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  metadata?: Record<string, any>;
}

/**
 * AI 응답 처리 설정
 */
export interface AIResponseProcessingConfig {
  outputFormat?: 'text' | 'json' | 'markdown';
  translate?: boolean;
  filterProfanity?: boolean;
  maxLength?: number;
  includeConfidence?: boolean;
}

export interface VirtualStudent {
  id: string;
  name: string;
  learningStyle: LearningStyle;
  personality: string;
  difficultyLevel: DifficultyLevel;
  subjects: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIResponse {
  content: string;
  timestamp: Date;
  studentId: string;
  context: string;
  originalPrompt: string;
} 