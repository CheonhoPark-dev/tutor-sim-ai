import { Timestamp } from 'firebase-admin/firestore';

// 기본 문서 타입
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 사용자 관련 타입
export interface User extends BaseDocument {
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

// 가상 학생 관련 타입
export type PersonalityTrait = 
  | '적극적' | '소극적' 
  | '논리적' | '직관적'
  | '독립적' | '협력적'
  | '신중한' | '모험적';

export type LearningStyle = 
  | '시각적' | '청각적' | '읽기/쓰기' | '실습형';

export type ComprehensionLevel = 
  | '초급' | '중급' | '고급';

export interface VirtualStudent extends BaseDocument {
  userId: string;
  name: string;
  personality: PersonalityTrait;
  learningStyle: LearningStyle;
  comprehensionLevel: ComprehensionLevel;
  interests: string[];
  challengeAreas: string[];
  isActive: boolean;
}

// 강의 관련 타입
export type LectureStatus = 
  | 'draft'      // 초안
  | 'in-progress' // 진행 중
  | 'completed'   // 완료됨
  | 'reviewed';   // 검토됨

export interface Lecture extends BaseDocument {
  userId: string;
  title: string;
  content: string;
  subject: string;
  virtualStudentId: string;
  duration: number;  // 분 단위
  status: LectureStatus;
}

// 피드백 관련 타입
export type FeedbackType = 
  | 'automatic'  // AI 자동 생성
  | 'manual';    // 사용자 직접 입력

export interface LectureFeedback extends BaseDocument {
  content: string;
  type: FeedbackType;
}

// 학습 자료 관련 타입
export interface Material extends BaseDocument {
  userId: string;
  title: string;
  content: string;
  subject: string;
  type: MaterialType;
  targetLevel: string;
  analysis?: MaterialAnalysis;
}

export type MaterialType = 'document' | 'image' | 'video' | 'audio';

export interface MaterialAnalysis extends BaseDocument {
  materialId: string;
  difficulty: string;
  keywords: string[];
  prerequisites: string[];
  improvements: string[];
  effectiveness: number;
}

// 통계 관련 타입
export interface UserStats extends BaseDocument {
  userId: string;
  totalLectures: number;
  totalDuration: number;
  averageRating: number;
  subjectBreakdown: Record<string, SubjectStats>;
}

export interface SubjectStats {
  lectureCount: number;
  totalDuration: number;
  averageRating: number;
  lastLectureDate: Timestamp;
} 