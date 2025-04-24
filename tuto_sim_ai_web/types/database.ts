import { Timestamp } from 'firebase/firestore';

// 기본 문서 타입
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 사용자 관련 타입
export type UserRole = 'user' | 'admin';

export interface UserPreferences {
  language: string;
  notifications: boolean;
  theme: 'light' | 'dark';
  aiTutorPersonality?: 'friendly' | 'strict' | 'encouraging' | 'analytical';
}

export interface User extends BaseDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  preferences: UserPreferences;
  totalLectures: number;
  totalDuration: number;
  averageScore: number;
}

// 강의 관련 타입
export type LectureStatus = 'draft' | 'completed' | 'reviewing';

export interface VirtualStudent {
  personality: 'active' | 'passive' | 'curious' | 'challenging';
  level: 'beginner' | 'intermediate' | 'advanced';
  questions: string[];
  reactions: string[];
}

export interface LectureFeedback {
  pace: 'too_fast' | 'good' | 'too_slow';
  clarity: 'clear' | 'moderate' | 'unclear';
  suggestions: string[];
  score: number;
}

export interface Lecture extends BaseDocument {
  userId: string;
  title: string;
  content: string;
  summary: string;
  duration: number;
  materials: string[];
  feedback: LectureFeedback;
  virtualStudent: VirtualStudent;
  status: LectureStatus;
}

// 학습 자료 관련 타입
export type MaterialType = 'pdf' | 'image' | 'text' | 'video';

export interface Material extends BaseDocument {
  userId: string;
  title: string;
  type: MaterialType;
  url: string;
  summary: string;
  generatedQuestions: string[];
}

// AI 피드백 관련 타입
export interface AIFeedback extends BaseDocument {
  lectureId: string;
  userId: string;
  content: string;
  type: 'improvement' | 'encouragement' | 'correction';
  category: 'content' | 'delivery' | 'engagement';
  timestamp: Timestamp;
}

// Firestore 타임스탬프 생성 유틸리티
export const createTimestamp = () => Timestamp.now();

// 새 문서 생성 시 기본 필드
export const getDefaultFields = (): Omit<BaseDocument, 'id'> => ({
  createdAt: createTimestamp(),
  updatedAt: createTimestamp(),
});

// 문서 업데이트 시 기본 필드
export const getUpdateFields = () => ({
  updatedAt: createTimestamp(),
}); 