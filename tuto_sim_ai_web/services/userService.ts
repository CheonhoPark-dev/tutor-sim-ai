import { User, UserRole, TutorProfile, BaseDocument, UserPreferences } from '@/types/database';
import {
  createDocument,
  getDocument,
  updateDocument,
  queryCollection,
  QueryOptions,
  findDocumentsByField
} from '@/lib/db';

const COLLECTION = 'users';

// 새 사용자 생성
export const createUser = async (
  uid: string,
  data: Omit<User, keyof BaseDocument | 'uid'> & { uid: string }
): Promise<User> => {
  return createDocument<User>(COLLECTION, uid, data);
};

// 사용자 정보 조회
export const getUser = async (uid: string): Promise<User | null> => {
  return getDocument<User>(COLLECTION, uid);
};

// 사용자 정보 업데이트
export const updateUser = async (
  uid: string,
  data: Partial<User>
): Promise<void> => {
  return updateDocument<User>(COLLECTION, uid, data);
};

// 튜터 프로필 업데이트
export const updateTutorProfile = async (
  uid: string,
  profile: TutorProfile
): Promise<void> => {
  return updateDocument<User>(COLLECTION, uid, { tutorProfile: profile });
};

// 역할별 사용자 검색
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const options: QueryOptions = {
    where: [{ field: 'role', operator: '==', value: role }]
  };
  return queryCollection<User>(COLLECTION, options);
};

// 과목으로 튜터 검색
export const getTutorsBySubject = async (subject: string): Promise<User[]> => {
  const options: QueryOptions = {
    where: [
      { field: 'role', operator: '==', value: 'tutor' },
      { field: 'tutorProfile.subjects', operator: 'array-contains', value: subject }
    ]
  };
  return queryCollection<User>(COLLECTION, options);
};

// 평점순으로 튜터 검색
export const getTopRatedTutors = async (limit: number = 10): Promise<User[]> => {
  const options: QueryOptions = {
    where: [{ field: 'role', operator: '==', value: 'tutor' }],
    orderBy: [{ field: 'tutorProfile.rating', direction: 'desc' }],
    limit
  };
  return queryCollection<User>(COLLECTION, options);
};

// 이메일로 사용자 검색
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await findDocumentsByField<User>(COLLECTION, 'email', email);
  return users.length > 0 ? users[0] : null;
};

// 사용자 기본 설정 업데이트
export const updateUserPreferences = async (
  uid: string,
  preferences: Partial<UserPreferences>
): Promise<void> => {
  const user = await getUser(uid);
  if (!user) throw new Error('User not found');
  
  return updateDocument<User>(COLLECTION, uid, {
    preferences: {
      ...user.preferences,
      ...preferences as UserPreferences
    }
  });
}; 