import { Session, SessionStatus, SessionFeedback, BaseDocument } from '@/types/database';
import {
  createDocument,
  getDocument,
  updateDocument,
  queryCollection,
  QueryOptions,
  findDocumentsByField
} from '@/lib/db';
import { Timestamp, WhereFilterOp } from 'firebase/firestore';

const COLLECTION = 'sessions';

// 새 세션 생성
export const createSession = async (
  data: Omit<Session, keyof BaseDocument | 'id'>
): Promise<Session> => {
  const id = crypto.randomUUID();
  return createDocument<Session>(COLLECTION, id, data);
};

// 세션 정보 조회
export const getSession = async (id: string): Promise<Session | null> => {
  return getDocument<Session>(COLLECTION, id);
};

// 세션 정보 업데이트
export const updateSession = async (
  id: string,
  data: Partial<Session>
): Promise<void> => {
  return updateDocument<Session>(COLLECTION, id, data);
};

// 세션 상태 업데이트
export const updateSessionStatus = async (
  id: string,
  status: SessionStatus
): Promise<void> => {
  return updateDocument<Session>(COLLECTION, id, { status });
};

// 튜터의 세션 목록 조회
export const getTutorSessions = async (
  tutorId: string,
  status?: SessionStatus,
  limit: number = 10
): Promise<Session[]> => {
  const options: QueryOptions = {
    where: [
      { field: 'tutorId', operator: '==' as WhereFilterOp, value: tutorId },
      ...(status ? [{ field: 'status', operator: '==' as WhereFilterOp, value: status }] : [])
    ],
    orderBy: [{ field: 'startTime', direction: 'desc' }],
    limit
  };
  return queryCollection<Session>(COLLECTION, options);
};

// 학생의 세션 목록 조회
export const getStudentSessions = async (
  studentId: string,
  status?: SessionStatus,
  limit: number = 10
): Promise<Session[]> => {
  const options: QueryOptions = {
    where: [
      { field: 'studentId', operator: '==' as WhereFilterOp, value: studentId },
      ...(status ? [{ field: 'status', operator: '==' as WhereFilterOp, value: status }] : [])
    ],
    orderBy: [{ field: 'startTime', direction: 'desc' }],
    limit
  };
  return queryCollection<Session>(COLLECTION, options);
};

// 특정 날짜의 세션 조회
export const getSessionsByDate = async (
  date: Date,
  tutorId?: string
): Promise<Session[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const options: QueryOptions = {
    where: [
      { field: 'startTime', operator: '>=' as WhereFilterOp, value: Timestamp.fromDate(startOfDay) },
      { field: 'startTime', operator: '<=' as WhereFilterOp, value: Timestamp.fromDate(endOfDay) },
      ...(tutorId ? [{ field: 'tutorId', operator: '==' as WhereFilterOp, value: tutorId }] : [])
    ],
    orderBy: [{ field: 'startTime', direction: 'asc' }]
  };
  
  return queryCollection<Session>(COLLECTION, options);
};

// 피드백 추가/업데이트
export const updateSessionFeedback = async (
  id: string,
  feedback: SessionFeedback
): Promise<void> => {
  return updateDocument<Session>(COLLECTION, id, { feedback });
};

// 녹화 URL 업데이트
export const updateSessionRecording = async (
  id: string,
  recordingUrl: string,
  duration: number
): Promise<void> => {
  return updateDocument<Session>(COLLECTION, id, {
    recording: { url: recordingUrl, duration }
  });
};

// 수업 자료 추가
export const addSessionMaterial = async (
  id: string,
  material: { url: string; type: string; name: string }
): Promise<void> => {
  const session = await getSession(id);
  if (!session) throw new Error('Session not found');

  return updateDocument<Session>(COLLECTION, id, {
    materials: [...session.materials, material]
  });
};

// 수업 노트 업데이트
export const updateSessionNotes = async (
  id: string,
  notes: string
): Promise<void> => {
  return updateDocument<Session>(COLLECTION, id, { notes });
};

// 특정 기간의 세션 통계
export const getSessionStats = async (
  tutorId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  completed: number;
  cancelled: number;
  totalDuration: number;
  averageRating: number;
}> => {
  const options: QueryOptions = {
    where: [
      { field: 'tutorId', operator: '==' as WhereFilterOp, value: tutorId },
      { field: 'startTime', operator: '>=' as WhereFilterOp, value: Timestamp.fromDate(startDate) },
      { field: 'startTime', operator: '<=' as WhereFilterOp, value: Timestamp.fromDate(endDate) }
    ]
  };

  const sessions = await queryCollection<Session>(COLLECTION, options);
  
  const stats = sessions.reduce((acc, session) => {
    acc.total++;
    if (session.status === 'completed') {
      acc.completed++;
      acc.totalDuration += session.duration;
      if (session.feedback?.rating) {
        acc.totalRating += session.feedback.rating;
        acc.ratingCount++;
      }
    } else if (session.status === 'cancelled') {
      acc.cancelled++;
    }
    return acc;
  }, {
    total: 0,
    completed: 0,
    cancelled: 0,
    totalDuration: 0,
    totalRating: 0,
    ratingCount: 0
  });

  return {
    total: stats.total,
    completed: stats.completed,
    cancelled: stats.cancelled,
    totalDuration: stats.totalDuration,
    averageRating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0
  };
}; 