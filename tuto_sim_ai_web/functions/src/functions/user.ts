import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { UserRecord } from '../types/functions';

// 사용자 등록 후처리 함수
export const userFunctions = {
  onUserCreated: onDocumentCreated('users/{userId}', async (event) => {
    try {
      const user = event.data?.data() as UserRecord;
      if (!user) {
        throw new Error('No user data found');
      }

      // Firestore에 사용자 프로필 생성
      await admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        role: 'user'
      });

      return null;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }),

  // 사용자 삭제 시 관련 데이터 정리
  onUserDeleted: onDocumentDeleted('users/{userId}', async (event) => {
    try {
      const userId = event.params.userId;
      const batch = admin.firestore().batch();
      
      // 사용자의 가상 학생들을 비활성화
      const virtualStudentsSnapshot = await admin.firestore()
        .collection('virtualStudents')
        .where('userId', '==', userId)
        .get();
      
      virtualStudentsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isActive: false });
      });

      await batch.commit();
      return null;
    } catch (error) {
      console.error('Error cleaning up user data:', error);
      throw new Error('Failed to clean up user data');
    }
  })
}; 