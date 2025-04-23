import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'student' | 'admin';
  isEmailVerified: boolean;
}

export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  try {
    const userRef = doc(db, 'users', uid);
    const now = new Date();
    
    const userData: UserProfile = {
      uid,
      email: data.email || '',
      displayName: data.displayName || '',
      photoURL: data.photoURL || '',
      createdAt: now,
      updatedAt: now,
      role: 'student',
      isEmailVerified: false,
      ...data
    };

    await setDoc(userRef, {
      ...userData,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    return userData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function getUserProfile(uid: string) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  try {
    const userRef = doc(db, 'users', uid);
    const now = new Date();
    const updateData = {
      ...data,
      updatedAt: now.toISOString(),
    };
    
    await updateDoc(userRef, updateData);
    return {
      ...data,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
} 