import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { FeedbackData, NotificationData, UserData } from '../types/functions';

export const notificationFunctions = {
  // 새로운 피드백 생성 시 알림 전송
  onFeedbackCreated: onDocumentCreated('lectures/{lectureId}/feedback/{feedbackId}', async (event) => {
    try {
      const feedbackData = event.data?.data() as FeedbackData;
      const lectureId = event.params.lectureId;

      // 강의 정보 가져오기
      const lectureDoc = await admin.firestore()
        .collection('lectures')
        .doc(lectureId)
        .get();

      const lectureData = lectureDoc.data();
      if (!lectureData) {
        throw new Error('Lecture not found');
      }

      const userId = lectureData.userId;

      // 사용자 알림 설정 확인
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      const userData = userDoc.data() as UserData;
      if (!userData || !userData.notificationsEnabled) {
        return null;
      }

      // 알림 생성
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .add({
          type: 'feedback',
          title: '새로운 피드백이 도착했습니다',
          message: `강의에 대한 새로운 피드백이 있습니다.`,
          lectureId: lectureId,
          feedbackId: event.params.feedbackId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        } as NotificationData);

      return null;
    } catch (error) {
      console.error('Error sending feedback notification:', error);
      throw new Error('Failed to send feedback notification');
    }
  }),

  // 예약된 알림 전송 (매일 오전 9시)
  scheduledNotifications: onSchedule({
    schedule: '0 9 * * *',
    timeZone: 'Asia/Seoul'
  }, async (event) => {
    try {
      const now = admin.firestore.Timestamp.now();
      const threeDaysAgo = new Date(now.toDate().getTime() - (3 * 24 * 60 * 60 * 1000));

      // 3일 동안 강의하지 않은 사용자 찾기
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('notificationsEnabled', '==', true)
        .get();

      const batch = admin.firestore().batch();
      
      for (const userDoc of usersSnapshot.docs) {
        const lastLectureDoc = await admin.firestore()
          .collection('users')
          .doc(userDoc.id)
          .collection('statistics')
          .doc('lectures')
          .get();

        const lastLectureData = lastLectureDoc.data();
        if (lastLectureData?.lastLectureAt?.toDate() < threeDaysAgo) {
          // 알림 생성
          const notificationRef = admin.firestore()
            .collection('users')
            .doc(userDoc.id)
            .collection('notifications')
            .doc();

          batch.set(notificationRef, {
            type: 'reminder',
            title: '강의 리마인더',
            message: '3일 동안 강의를 하지 않았습니다. 학습 진행 상황을 확인해보세요.',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false
          } as NotificationData);
        }
      }

      await batch.commit();
      return null;
    } catch (error) {
      console.error('Error sending scheduled notifications:', error);
      throw new Error('Failed to send scheduled notifications');
    }
  })
}; 