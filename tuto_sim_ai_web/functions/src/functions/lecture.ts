import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { LectureData } from '../types/functions';

export const lectureFunctions = {
  // 강의 생성 시 통계 업데이트
  onLectureCreated: onDocumentCreated('lectures/{lectureId}', async (event) => {
    try {
      const lectureData = event.data?.data() as LectureData;
      if (!lectureData) {
        throw new Error('No lecture data found');
      }

      const userId = lectureData.userId;
      const virtualStudentId = lectureData.virtualStudentId;

      // 사용자의 강의 통계 업데이트
      const userStatsRef = admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('statistics')
        .doc('lectures');

      await userStatsRef.set({
        totalLectures: admin.firestore.FieldValue.increment(1),
        lastLectureAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 가상 학생의 강의 통계 업데이트
      const studentStatsRef = admin.firestore()
        .collection('virtualStudents')
        .doc(virtualStudentId)
        .collection('statistics')
        .doc('lectures');

      await studentStatsRef.set({
        totalLectures: admin.firestore.FieldValue.increment(1),
        lastLectureAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return null;
    } catch (error) {
      console.error('Error updating lecture statistics:', error);
      throw new Error('Failed to update lecture statistics');
    }
  }),

  // 강의 완료 시 피드백 생성
  onLectureCompleted: onDocumentUpdated('lectures/{lectureId}', async (event) => {
    try {
      const beforeData = event.data?.before.data() as LectureData;
      const afterData = event.data?.after.data() as LectureData;

      // 강의 상태가 'completed'로 변경된 경우에만 실행
      if (beforeData?.status !== 'completed' && afterData?.status === 'completed') {
        const lectureId = event.params.lectureId;
        const virtualStudentId = afterData.virtualStudentId;

        // 가상 학생 정보 가져오기
        const studentDoc = await admin.firestore()
          .collection('virtualStudents')
          .doc(virtualStudentId)
          .get();

        const studentData = studentDoc.data();

        // 피드백 생성
        await admin.firestore()
          .collection('lectures')
          .doc(lectureId)
          .collection('feedback')
          .add({
            content: `강의에 대한 ${studentData?.name}의 피드백이 여기에 생성됩니다.`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            virtualStudentId: virtualStudentId,
            type: 'completion'
          });
      }

      return null;
    } catch (error) {
      console.error('Error generating lecture feedback:', error);
      throw new Error('Failed to generate lecture feedback');
    }
  })
}; 