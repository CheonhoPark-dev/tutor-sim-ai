import { 
  ref, 
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
  updateMetadata
} from 'firebase/storage';
import { storage } from './firebase';

// 파일 경로 생성 유틸리티
const getStoragePath = (userId: string, type: 'lectures' | 'materials', filename: string) => {
  return `users/${userId}/${type}/${filename}`;
};

// 파일 업로드 함수
export const uploadFile = async (
  userId: string,
  type: 'lectures' | 'materials',
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // 파일 이름에 타임스탬프 추가하여 고유성 보장
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const path = getStoragePath(userId, type, filename);
    const storageRef = ref(storage, path);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// 파일 삭제 함수
export const deleteFile = async (url: string): Promise<void> => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

// 사용자의 파일 목록 조회
export const listUserFiles = async (
  userId: string,
  type: 'lectures' | 'materials'
): Promise<{ name: string; url: string }[]> => {
  try {
    const folderRef = ref(storage, `users/${userId}/${type}`);
    const fileList = await listAll(folderRef);
    
    const files = await Promise.all(
      fileList.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url
        };
      })
    );

    return files;
  } catch (error) {
    console.error('List files error:', error);
    throw error;
  }
};

// 파일 메타데이터 업데이트
export const updateFileMetadata = async (
  url: string,
  metadata: { [key: string]: string }
): Promise<void> => {
  try {
    const fileRef = ref(storage, url);
    await updateMetadata(fileRef, {
      customMetadata: metadata
    });
  } catch (error) {
    console.error('Update metadata error:', error);
    throw error;
  }
};

// 파일 URL이 유효한지 확인
export const isValidFileURL = async (url: string): Promise<boolean> => {
  try {
    const fileRef = ref(storage, url);
    await getDownloadURL(fileRef);
    return true;
  } catch (error) {
    return false;
  }
}; 