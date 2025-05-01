import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as express from 'express';
import { Request, Response } from 'express';
import { authMiddleware, checkRole, AuthRequest } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { KeyManager } from './services/keyManager';

// 타입 정의
interface VirtualStudent {
  personality: string;
  learningStyle: string;
  difficultyLevel: string;
  createdAt: admin.firestore.Timestamp;
  userId: string;
}

interface LectureFeedback {
  virtualStudentId: string;
  lectureContent: string;
  feedback: string;
  createdAt: admin.firestore.Timestamp;
  userId: string;
}

interface MaterialAnalysis {
  materialContent: string;
  subject: string;
  targetLevel: string;
  analysis: string;
  createdAt: admin.firestore.Timestamp;
  userId: string;
}

// Firebase Admin 초기화
admin.initializeApp();

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Firestore 참조
const db = admin.firestore();

const app = express();

// 미들웨어 적용
app.use(express.json());
app.use(authMiddleware);
app.use(rateLimitMiddleware);

// Gemini API 엔드포인트
app.post('/api/gemini/chat', checkRole(['user', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const keyManager = KeyManager.getInstance();
    const apiKey = await keyManager.getKey('gemini');
    
    // Gemini API 호출 로직은 추후 구현
    // TODO: Implement Gemini API call

    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Gemini API 오류:', error);
    res.status(500).json({ error: '내부 서버 오류가 발생했습니다.' });
  }
});

// 강의 생성 시 AI 피드백 생성
export const generateAIFeedback = functions.firestore
  .document('lectures/{lectureId}')
  .onCreate(async (snap, context) => {
    const lectureData = snap.data();
    const lectureId = context.params.lectureId;

    try {
      // Gemini AI 모델 생성
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // 강의 내용을 기반으로 프롬프트 생성
      const prompt = `
        다음 강의 내용을 분석하고 피드백을 제공해주세요:
        제목: ${lectureData.title}
        내용: ${lectureData.content}
        
        다음 항목들에 대해 평가해주세요:
        1. 강의 구조의 명확성
        2. 설명의 효과성
        3. 개선이 필요한 부분
        4. 학습자의 이해를 돕기 위한 제안
      `;

      // AI 응답 생성
      const result = await model.generateContent(prompt);
      const response = result.response;
      const feedback = response.text();

      // AI 피드백을 Firestore에 저장
      await db.collection('lectures').doc(lectureId).collection('aiFeedback').add({
        feedback,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        type: 'automatic'
      });

      return { success: true };
    } catch (error) {
      console.error('AI 피드백 생성 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
  });

// 학습 자료 업로드 시 메타데이터 분석
export const analyzeMaterialMetadata = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    if (!filePath) return;

    // 학습 자료 폴더에 있는 파일만 처리
    if (!filePath.includes('materials/')) return;

    try {
      const metadata = {
        contentType: object.contentType,
        size: object.size,
        timeCreated: object.timeCreated,
        updated: object.updated
      };

      // 파일 경로에서 사용자 ID와 파일 이름 추출
      const pathParts = filePath.split('/');
      const userId = pathParts[1];
      const fileName = pathParts[pathParts.length - 1];

      // 메타데이터를 Firestore에 저장
      await db.collection('users').doc(userId).collection('materials').add({
        fileName,
        filePath,
        metadata,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('자료 메타데이터 분석 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
  });

// 사용자 통계 업데이트
export const updateUserStats = functions.firestore
  .document('lectures/{lectureId}')
  .onWrite(async (change, context) => {
    const lectureId = context.params.lectureId;
    const afterData = change.after.data();
    if (!afterData) return;

    const userId = afterData.userId;

    try {
      // 사용자의 모든 강의 가져오기
      const lectures = await db.collection('lectures')
        .where('userId', '==', userId)
        .get();

      // 통계 계산
      const stats = {
        totalLectures: lectures.size,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };

      // 사용자 통계 업데이트
      await db.collection('users').doc(userId).collection('stats').doc('lectures').set(
        stats,
        { merge: true }
      );

      return { success: true };
    } catch (error) {
      console.error('사용자 통계 업데이트 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
  });

// 가상 학생 생성 함수
export const createVirtualStudent = functions.https.onCall(async (data: {
  personality: string;
  learningStyle: string;
  difficultyLevel: string;
}, context: functions.https.CallableContext): Promise<VirtualStudent & { id: string }> => {
  // 사용자 인증 확인
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '인증이 필요합니다.');
  }

  try {
    const { personality, learningStyle, difficultyLevel } = data;
    
    // 가상 학생 프로필 생성
    const studentProfile: VirtualStudent = {
      personality,
      learningStyle,
      difficultyLevel,
      createdAt: admin.firestore.Timestamp.now(),
      userId: context.auth.uid
    };

    // Firestore에 가상 학생 프로필 저장
    const docRef = await admin.firestore()
      .collection('virtualStudents')
      .add(studentProfile);

    return { id: docRef.id, ...studentProfile };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new functions.https.HttpsError('internal', error.message);
    }
    throw new functions.https.HttpsError('internal', '가상 학생 생성 중 오류가 발생했습니다.');
  }
});

// 강의 피드백 생성 함수
export const generateLectureFeedback = functions.https.onCall(async (data: {
  lectureContent: string;
  virtualStudentId: string;
}, context: functions.https.CallableContext): Promise<{ feedback: string }> => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '인증이 필요합니다.');
  }

  try {
    const { lectureContent, virtualStudentId } = data;

    // 가상 학생 프로필 조회
    const studentDoc = await admin.firestore()
      .collection('virtualStudents')
      .doc(virtualStudentId)
      .get();

    if (!studentDoc.exists) {
      throw new functions.https.HttpsError('not-found', '가상 학생을 찾을 수 없습니다.');
    }

    const studentProfile = studentDoc.data() as VirtualStudent;

    // Gemini AI를 사용하여 피드백 생성
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      당신은 다음과 같은 특성을 가진 가상 학생입니다:
      - 성격: ${studentProfile.personality}
      - 학습 스타일: ${studentProfile.learningStyle}
      - 난이도 수준: ${studentProfile.difficultyLevel}

      다음 강의 내용에 대해 학생의 관점에서 피드백을 제공해주세요:
      ${lectureContent}

      다음 형식으로 응답해주세요:
      1. 이해도 (1-10)
      2. 긍정적인 피드백
      3. 개선이 필요한 부분
      4. 추가 질문
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();

    // 피드백 저장
    const feedbackData: LectureFeedback = {
      virtualStudentId,
      lectureContent,
      feedback,
      createdAt: admin.firestore.Timestamp.now(),
      userId: context.auth.uid
    };

    await admin.firestore()
      .collection('lectureFeedback')
      .add(feedbackData);

    return { feedback };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new functions.https.HttpsError('internal', error.message);
    }
    throw new functions.https.HttpsError('internal', '피드백 생성 중 오류가 발생했습니다.');
  }
});

// 학습 자료 분석 함수
export const analyzeLearningMaterial = functions.https.onCall(async (data: {
  materialContent: string;
  subject: string;
  targetLevel: string;
}, context: functions.https.CallableContext): Promise<{ analysis: string }> => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '인증이 필요합니다.');
  }

  try {
    const { materialContent, subject, targetLevel } = data;

    // Gemini AI를 사용하여 학습 자료 분석
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      다음 학습 자료를 분석해주세요:
      과목: ${subject}
      목표 수준: ${targetLevel}
      내용:
      ${materialContent}

      다음 항목을 포함하여 분석해주세요:
      1. 난이도 평가 (초급/중급/고급)
      2. 주요 개념 및 키워드
      3. 선수 지식 요구사항
      4. 보완이 필요한 부분
      5. 학습 목표 달성 가능성
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    // 분석 결과 저장
    const analysisData: MaterialAnalysis = {
      materialContent,
      subject,
      targetLevel,
      analysis,
      createdAt: admin.firestore.Timestamp.now(),
      userId: context.auth.uid
    };

    await admin.firestore()
      .collection('materialAnalysis')
      .add(analysisData);

    return { analysis };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new functions.https.HttpsError('internal', error.message);
    }
    throw new functions.https.HttpsError('internal', '학습 자료 분석 중 오류가 발생했습니다.');
  }
});

// Cloud Functions로 내보내기
export const api = functions.region('asia-northeast3').https.onRequest(app); 