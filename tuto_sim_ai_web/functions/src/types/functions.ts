import { Change, EventContext } from 'firebase-functions';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { ObjectMetadata } from 'firebase-functions/v1/storage';

export interface UserRecord {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export interface LectureData {
  userId: string;
  virtualStudentId: string;
  title: string;
  content: string;
  status: 'draft' | 'in-progress' | 'completed' | 'reviewed';
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface FeedbackData {
  content: string;
  virtualStudentId: string;
  type: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface UserData {
  email: string;
  displayName: string;
  photoURL: string;
  notificationsEnabled: boolean;
  role: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface MaterialData {
  userId: string;
  filePath: string;
  fileName: string;
  contentType: string;
  size: number;
  type: string;
  description: string;
  status: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface NotificationData {
  type: 'feedback' | 'reminder';
  title: string;
  message: string;
  lectureId?: string;
  feedbackId?: string;
  createdAt: FirebaseFirestore.Timestamp;
  read: boolean;
} 