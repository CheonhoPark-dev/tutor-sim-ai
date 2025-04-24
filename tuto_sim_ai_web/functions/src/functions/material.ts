import { onObjectFinalized, onObjectDeleted } from 'firebase-functions/v2/storage';
import * as admin from 'firebase-admin';
import { MaterialData } from '../types/functions';

export const materialFunctions = {
  // 학습 자료 업로드 완료 시 처리
  onMaterialUploaded: onObjectFinalized(async (event) => {
    try {
      const object = event.data;
      const filePath = object.name;
      const contentType = object.contentType;
      const metadata = object.metadata || {};
      const userId = metadata.userId;

      if (!filePath || !userId) {
        throw new Error('Missing required metadata');
      }

      // Firestore에 자료 정보 저장
      await admin.firestore()
        .collection('materials')
        .add({
          userId: userId,
          filePath: filePath,
          fileName: object.name?.split('/').pop() || '',
          contentType: contentType,
          size: object.size,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'uploaded',
          type: metadata.type || 'document',
          description: metadata.description || ''
        } as MaterialData);

      return null;
    } catch (error) {
      console.error('Error processing uploaded material:', error);
      throw new Error('Failed to process uploaded material');
    }
  }),

  // 학습 자료 삭제 시 처리
  onMaterialDeleted: onObjectDeleted(async (event) => {
    try {
      const filePath = event.data.name;
      
      // Firestore에서 관련 자료 정보 삭제
      const materialsSnapshot = await admin.firestore()
        .collection('materials')
        .where('filePath', '==', filePath)
        .get();

      const batch = admin.firestore().batch();
      materialsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return null;
    } catch (error) {
      console.error('Error cleaning up deleted material:', error);
      throw new Error('Failed to clean up deleted material');
    }
  })
}; 