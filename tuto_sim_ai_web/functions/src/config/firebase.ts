import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// 서비스 계정 키 파일 경로
const serviceAccountPath = path.join(__dirname, 'serviceAccount', 'tutosimai-firebase-adminsdk-fbsvc-1ecb356a57.json');
const serviceAccount = require(serviceAccountPath);

// Firebase 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

// Firebase 서비스 내보내기
export const db = getFirestore();
export const storage = admin.storage();
export const auth = admin.auth(); 