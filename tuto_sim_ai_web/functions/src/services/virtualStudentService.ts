import { db } from '../config/firebase';
import { VirtualStudent } from '../types/database';
import { AppError } from '../types/utils';
import { QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

class VirtualStudentService {
  private collection = 'virtualStudents';

  /**
   * 가상 학생 정보 조회
   */
  async getVirtualStudent(studentId: string): Promise<VirtualStudent> {
    try {
      const doc = await db.collection(this.collection).doc(studentId).get();
      
      if (!doc.exists) {
        throw new AppError('NOT_FOUND', '가상 학생을 찾을 수 없습니다.');
      }

      return {
        id: doc.id,
        ...doc.data()
      } as VirtualStudent;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('FETCH_FAILED', '가상 학생 정보 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자의 가상 학생 목록 조회
   */
  async getUserVirtualStudents(userId: string): Promise<VirtualStudent[]> {
    try {
      const snapshot = await db.collection(this.collection)
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as VirtualStudent[];
    } catch (error) {
      throw new AppError('FETCH_FAILED', '가상 학생 목록 조회 중 오류가 발생했습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const virtualStudentService = new VirtualStudentService(); 