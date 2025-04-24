import { db } from '../config/firebase';
import { Lecture, LectureStatus, LectureFeedback } from '../types/database';
import { AppError, ValidationResult } from '../types/utils';
import { Timestamp, DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { virtualStudentService } from './virtualStudentService';
import { generateAIFeedback } from './aiService';

class LectureService {
  private collection = 'lectures';

  /**
   * 새로운 강의 세션 생성
   */
  async createLecture(
    userId: string,
    data: {
      title: string;
      content: string;
      subject: string;
      virtualStudentId: string;
      duration?: number;
    }
  ): Promise<Lecture> {
    try {
      // 가상 학생 존재 여부 확인
      await virtualStudentService.getVirtualStudent(data.virtualStudentId);

      // 입력값 검증
      const validation = this.validateLectureData(data);
      if (!validation.isValid) {
        throw new AppError('INVALID_INPUT', `유효하지 않은 강의 데이터: ${validation.errors?.join(', ')}`);
      }

      // 문서 데이터 준비
      const now = Timestamp.now();
      const lectureData: Omit<Lecture, 'id'> = {
        userId,
        title: data.title,
        content: data.content,
        subject: data.subject,
        virtualStudentId: data.virtualStudentId,
        duration: data.duration || 0,
        status: 'draft' as LectureStatus,
        createdAt: now,
        updatedAt: now
      };

      // Firestore에 저장
      const docRef = await db.collection(this.collection).add(lectureData);
      
      // AI 피드백 자동 생성 시작
      this.generateInitialFeedback(docRef.id, lectureData);

      return {
        id: docRef.id,
        ...lectureData
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('CREATE_FAILED', '강의 세션 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * 강의 정보 조회
   */
  async getLecture(lectureId: string): Promise<Lecture> {
    try {
      const doc = await db.collection(this.collection).doc(lectureId).get();
      
      if (!doc.exists) {
        throw new AppError('NOT_FOUND', '강의를 찾을 수 없습니다.');
      }

      return {
        id: doc.id,
        ...doc.data()
      } as Lecture;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('FETCH_FAILED', '강의 정보 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자의 모든 강의 조회
   */
  async getUserLectures(
    userId: string,
    options?: {
      status?: LectureStatus;
      subject?: string;
      limit?: number;
      startAfter?: Timestamp;
    }
  ): Promise<Lecture[]> {
    try {
      let query = db.collection(this.collection)
        .where('userId', '==', userId);

      if (options?.status) {
        query = query.where('status', '==', options.status);
      }

      if (options?.subject) {
        query = query.where('subject', '==', options.subject);
      }

      query = query.orderBy('createdAt', 'desc');

      if (options?.startAfter) {
        query = query.startAfter(options.startAfter);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as Lecture[];
    } catch (error) {
      throw new AppError('FETCH_FAILED', '강의 목록 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 강의 내용 업데이트
   */
  async updateLecture(
    lectureId: string,
    updates: Partial<Omit<Lecture, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'virtualStudentId'>>
  ): Promise<Lecture> {
    try {
      // 강의 존재 여부 확인
      const lecture = await this.getLecture(lectureId);

      // 업데이트 데이터 준비
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      // Firestore 업데이트
      await db.collection(this.collection).doc(lectureId).update(updateData);

      // 내용이 변경된 경우 새로운 AI 피드백 생성
      if (updates.content) {
        this.generateFeedbackForUpdate(lectureId, updates.content);
      }

      return {
        ...lecture,
        ...updates,
        updatedAt: updateData.updatedAt
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('UPDATE_FAILED', '강의 정보 업데이트 중 오류가 발생했습니다.');
    }
  }

  /**
   * 강의 상태 변경
   */
  async updateLectureStatus(lectureId: string, status: LectureStatus): Promise<void> {
    try {
      await db.collection(this.collection).doc(lectureId).update({
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new AppError('UPDATE_FAILED', '강의 상태 변경 중 오류가 발생했습니다.');
    }
  }

  /**
   * 강의 피드백 조회
   */
  async getLectureFeedback(lectureId: string): Promise<LectureFeedback[]> {
    try {
      const snapshot = await db.collection(this.collection)
        .doc(lectureId)
        .collection('feedback')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as LectureFeedback[];
    } catch (error) {
      throw new AppError('FETCH_FAILED', '강의 피드백 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 초기 AI 피드백 생성 (비동기)
   */
  private async generateInitialFeedback(lectureId: string, lectureData: Omit<Lecture, 'id'>): Promise<void> {
    try {
      const feedback = await generateAIFeedback({
        lectureContent: lectureData.content,
        virtualStudentId: lectureData.virtualStudentId
      });

      const now = Timestamp.now();
      await db.collection(this.collection)
        .doc(lectureId)
        .collection('feedback')
        .add({
          content: feedback,
          type: 'automatic',
          createdAt: now,
          updatedAt: now
        });
    } catch (error) {
      console.error('초기 AI 피드백 생성 중 오류:', error);
      // 피드백 생성 실패는 강의 생성에 영향을 주지 않음
    }
  }

  /**
   * 업데이트된 내용에 대한 AI 피드백 생성 (비동기)
   */
  private async generateFeedbackForUpdate(lectureId: string, content: string): Promise<void> {
    try {
      const lecture = await this.getLecture(lectureId);
      const feedback = await generateAIFeedback({
        lectureContent: content,
        virtualStudentId: lecture.virtualStudentId
      });

      const now = Timestamp.now();
      await db.collection(this.collection)
        .doc(lectureId)
        .collection('feedback')
        .add({
          content: feedback,
          type: 'automatic',
          createdAt: now,
          updatedAt: now
        });
    } catch (error) {
      console.error('업데이트 AI 피드백 생성 중 오류:', error);
    }
  }

  /**
   * 강의 데이터 검증
   */
  private validateLectureData(
    data: Partial<Lecture>
  ): ValidationResult {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('강의 제목을 입력해주세요');
    }

    if (!data.content?.trim()) {
      errors.push('강의 내용을 입력해주세요');
    }

    if (!data.subject?.trim()) {
      errors.push('과목을 선택해주세요');
    }

    if (!data.virtualStudentId) {
      errors.push('가상 학생을 선택해주세요');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const lectureService = new LectureService(); 