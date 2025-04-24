import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Timestamp,
  WhereFilterOp,
  OrderByDirection
} from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';
import { BaseDocument } from '../types/database';
import { QueryOptions } from './types';

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 문서 생성
export async function createDocument<T extends BaseDocument>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<T> {
  const collectionRef = collection(db, collectionName);
  const docRef = doc(collectionRef);
  
  await setDoc(docRef, {
    ...data,
    id: docRef.id
  });

  return {
    ...data,
    id: docRef.id
  } as T;
}

// 문서 조회
export async function getDocument<T extends BaseDocument>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { ...docSnap.data(), id: docSnap.id } as T;
}

// 문서 업데이트
export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<any>
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

// 컬렉션 쿼리
export async function queryCollection<T extends BaseDocument>(
  collectionName: string,
  options: QueryOptions
): Promise<T[]> {
  const collectionRef = collection(db, collectionName);
  
  let q = query(collectionRef);

  if (options.where) {
    for (const [field, op, value] of options.where) {
      q = query(q, where(field, op, value));
    }
  }

  if (options.orderBy) {
    for (const [field, direction] of options.orderBy) {
      q = query(q, orderBy(field, direction));
    }
  }

  if (options.limit) {
    q = query(q, limit(options.limit));
  }

  if (options.startAfter) {
    q = query(q, startAfter(options.startAfter));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as T);
}

// 기본 필드 생성
export function getDefaultFields() {
  return {
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
}

// 업데이트 필드 생성
export function getUpdateFields() {
  return {
    updatedAt: Timestamp.now()
  };
} 