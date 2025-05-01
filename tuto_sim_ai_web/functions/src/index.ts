import * as functions from 'firebase-functions/v2';
import { HttpsError, onCall, CallableRequest, CallableResponse } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentWritten, Change, QueryDocumentSnapshot } from 'firebase-functions/v2/firestore';
import { onObjectFinalized, StorageEvent } from 'firebase-functions/v2/storage';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI, PromptFeedback } from '@google/generative-ai';
import express, { Request, Response } from 'express';
import { authMiddleware, checkRole, AuthRequest } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { KeyManager } from './services/keyManager';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { createAuditMiddleware } from './middleware/auditMiddleware';
import { createMonitoringMiddleware } from './middleware/monitoringMiddleware';
import { metricsHandler } from './monitoring/metrics';
import { AuditService } from './services/AuditService';
import { AuditEventType, AuditEventSeverity } from './types/audit';
import { SpeechClient, protos } from '@google-cloud/speech';

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

// 기본 미들웨어
app.use(cors());
app.use(express.json());

// 레이트 리미터 설정 (100 요청/분)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // 'RateLimit-*' 헤더 포함
  legacyHeaders: false, // 'X-RateLimit-*' 헤더 비활성화
});

app.use('/', limiter as any);

// 감사 로깅 서비스 초기화
const auditService = new AuditService(admin.firestore());

// 모니터링 및 감사 로깅 미들웨어 적용
app.use(createMonitoringMiddleware());
app.use(createAuditMiddleware(auditService));

// 메트릭스 엔드포인트
app.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await metricsHandler();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    console.error('Error collecting metrics:', error);
    res.status(500).send('Error collecting metrics');
  }
});

// 미들웨어 적용
app.use(authMiddleware);
app.use(rateLimitMiddleware);

// Gemini API 엔드포인트
app.post('/api/gemini/chat', checkRole(['user', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, context = '', modelName = 'gemini-pro' } = req.body;
    
    if (!prompt) {
      throw new HttpsError('invalid-argument', '프롬프트는 필수입니다.');
    }

    // API 키 가져오기
    const keyManager = KeyManager.getInstance();
    const apiKey = await keyManager.getKey('gemini');
    
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'Gemini API 키가 설정되지 않았습니다.');
    }

    // Gemini 모델 초기화
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // 채팅 컨텍스트 설정
    const chat = model.startChat({
      history: context ? JSON.parse(context) : [],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // 응답 생성
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    // 감사 로그 기록
    await auditService.logEvent({
      eventType: AuditEventType.API_REQUEST,
      severity: AuditEventSeverity.INFO,
      userId: req.user?.uid,
      action: 'GEMINI_CHAT',
      status: 'success',
      details: {
        prompt,
        modelUsed: modelName,
        tokensUsed: (response.promptFeedback as any)?.safetyRatings?.length || 0
      },
      metadata: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: req.headers['x-request-id'],
        path: req.path,
        method: req.method
      }
    });

    res.json({
      success: true,
      response: text,
      promptFeedback: response.promptFeedback
    });

  } catch (error: any) {
    console.error('Gemini API 오류:', error);

    // 감사 로그에 오류 기록
    await auditService.logEvent({
      eventType: AuditEventType.API_REQUEST,
      severity: AuditEventSeverity.ERROR,
      userId: (req as AuthRequest).user?.uid,
      action: 'GEMINI_CHAT',
      status: 'failure',
      details: {
        error: error.message,
        code: error.code
      },
      metadata: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: req.headers['x-request-id'],
        path: req.path,
        method: req.method
      }
    });

    if (error instanceof HttpsError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: '내부 서버 오류가 발생했습니다.' });
    }
  }
});

// 강의 생성 시 AI 피드백 생성
export const generateAIFeedback = onDocumentCreated('lectures/{lectureId}', async (event) => {
  const lectureData = event.data?.data();
  const lectureId = event.params.lectureId;
  if (!lectureData) return;

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
    if (error instanceof Error) {
      console.error('AI 피드백 생성 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
    throw error;
  }
});

// 학습 자료 업로드 시 메타데이터 분석
export const analyzeMaterialMetadata = onObjectFinalized(async (event: StorageEvent) => {
  const filePath = event.data.name;
  if (!filePath) return;

  // 학습 자료 폴더에 있는 파일만 처리
  if (!filePath.includes('materials/')) return;

  try {
    const metadata = {
      contentType: event.data.contentType,
      size: event.data.size,
      timeCreated: event.data.timeCreated,
      updated: event.data.updated
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
    if (error instanceof Error) {
      console.error('자료 메타데이터 분석 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
    throw error;
  }
});

// 사용자 통계 업데이트
export const updateUserStats = onDocumentWritten('lectures/{lectureId}', async (event) => {
  const afterData = event.data?.after.data();
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
    if (error instanceof Error) {
      console.error('사용자 통계 업데이트 중 오류 발생:', error);
      return { success: false, error: error.message };
    }
    throw error;
  }
});

// 가상 학생 생성 함수
export const createVirtualStudent = onCall<
  { personality: string; learningStyle: string; difficultyLevel: string },
  Promise<VirtualStudent & { id: string }>
>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '인증이 필요합니다.');
  }

  try {
    const { personality, learningStyle, difficultyLevel } = request.data;
    
    const studentProfile: VirtualStudent = {
      personality,
      learningStyle,
      difficultyLevel,
      createdAt: admin.firestore.Timestamp.now(),
      userId: request.auth.uid
    };

    const docRef = await admin.firestore()
      .collection('virtualStudents')
      .add(studentProfile);

    return { id: docRef.id, ...studentProfile };
  } catch (error) {
    if (error instanceof Error) {
      throw new HttpsError('internal', error.message);
    }
    throw new HttpsError('internal', '가상 학생 생성 중 오류가 발생했습니다.');
  }
});

// 강의 피드백 생성 함수
export const generateLectureFeedback = onCall<
  { lectureContent: string; virtualStudentId: string },
  Promise<{ feedback: string }>
>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '인증이 필요합니다.');
  }

  try {
    const { lectureContent, virtualStudentId } = request.data;

    const studentDoc = await admin.firestore()
      .collection('virtualStudents')
      .doc(virtualStudentId)
      .get();

    if (!studentDoc.exists) {
      throw new HttpsError('not-found', '가상 학생을 찾을 수 없습니다.');
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
      userId: request.auth.uid
    };

    await admin.firestore()
      .collection('lectureFeedback')
      .add(feedbackData);

    return { feedback };
  } catch (error) {
    if (error instanceof Error) {
      throw new HttpsError('internal', error.message);
    }
    throw new HttpsError('internal', '피드백 생성 중 오류가 발생했습니다.');
  }
});

// 학습 자료 분석 함수
export const analyzeLearningMaterial = onCall<
  { materialContent: string; subject: string; targetLevel: string },
  Promise<{ analysis: string }>
>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '인증이 필요합니다.');
  }

  try {
    const { materialContent, subject, targetLevel } = request.data;

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
      userId: request.auth.uid
    };

    await admin.firestore()
      .collection('materialAnalysis')
      .add(analysisData);

    return { analysis };
  } catch (error) {
    if (error instanceof Error) {
      throw new HttpsError('internal', error.message);
    }
    throw new HttpsError('internal', '학습 자료 분석 중 오류가 발생했습니다.');
  }
});

// STT API 엔드포인트
app.post('/api/stt', checkRole(['user', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { audioContent, config = {} } = req.body;

    if (!audioContent) {
      throw new HttpsError('invalid-argument', '오디오 데이터는 필수입니다.');
    }

    // API 키 가져오기
    const keyManager = KeyManager.getInstance();
    const credentials = await keyManager.getKey('google-cloud');

    if (!credentials) {
      throw new HttpsError('failed-precondition', 'Google Cloud 인증 정보가 설정되지 않았습니다.');
    }

    // STT 클라이언트 초기화
    const client = new SpeechClient({ credentials: JSON.parse(credentials) });

    // 기본 설정과 사용자 설정 병합
    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
      audio: {
        content: audioContent,  // base64로 인코딩된 오디오 데이터
      },
      config: {
        encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
        sampleRateHertz: 16000,
        languageCode: 'ko-KR',
        ...config,
      },
    };

    // 감사 로그 기록
    await auditService.logEvent({
      eventType: AuditEventType.API_REQUEST,
      severity: AuditEventSeverity.INFO,
      userId: req.user?.uid,
      action: 'STT_REQUEST',
      status: 'success',
      details: {
        requestConfig: request.config,
      },
      metadata: {
        endpoint: '/api/stt',
      },
    });

    // STT 요청 실행
    const [response] = await client.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .filter((transcript): transcript is string => transcript !== undefined)
      .join('\n');

    res.json({
      success: true,
      text: transcription,
      results: response.results,
    });

  } catch (error: unknown) {
    // 에러 로깅
    await auditService.logEvent({
      eventType: AuditEventType.API_REQUEST,
      severity: AuditEventSeverity.ERROR,
      userId: req.user?.uid,
      action: 'STT_REQUEST',
      status: 'failure',
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
      metadata: {
        endpoint: '/api/stt',
      },
    });

    console.error('STT API 에러:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Cloud Functions로 내보내기
export const api = functions.https.onRequest(app); 