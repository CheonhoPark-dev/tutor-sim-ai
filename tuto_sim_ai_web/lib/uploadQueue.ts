import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface QueuedUpload {
  id: string;
  file: File;
  path: string;
  metadata?: any;
  onProgress?: (progress: number) => void;
  onComplete?: (url: string) => void;
  onError?: (error: Error) => void;
}

class UploadQueue {
  private queue: QueuedUpload[] = [];
  private isProcessing: boolean = false;

  // 큐 길이 반환
  getQueueLength(): number {
    return this.queue.length;
  }

  // IndexedDB에 큐 저장
  private async saveQueue() {
    try {
      const db = await this.openDB();
      const tx = db.transaction('uploads', 'readwrite');
      const store = tx.objectStore('uploads');
      
      // 기존 데이터 삭제
      await store.clear();
      
      // 새 큐 데이터 저장
      for (const item of this.queue) {
        await store.add({
          id: item.id,
          file: item.file,
          path: item.path,
          metadata: item.metadata
        });
      }
    } catch (error) {
      console.error('Failed to save upload queue:', error);
    }
  }

  // IndexedDB에서 큐 로드
  private async loadQueue() {
    try {
      const db = await this.openDB();
      const tx = db.transaction('uploads', 'readonly');
      const store = tx.objectStore('uploads');
      const request = store.getAll();
      
      return new Promise<void>((resolve, reject) => {
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const items = request.result;
          this.queue = items.map(item => ({
            id: item.id,
            file: item.file,
            path: item.path,
            metadata: item.metadata,
            onProgress: (progress: number) => {
              console.log(`Upload progress for ${item.id}: ${progress}%`);
            },
            onComplete: (url: string) => {
              console.log(`Upload completed for ${item.id}: ${url}`);
            },
            onError: (error: Error) => {
              console.error(`Upload failed for ${item.id}:`, error);
            }
          }));
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to load upload queue:', error);
    }
  }

  // IndexedDB 초기화
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('uploadQueue', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('uploads')) {
          db.createObjectStore('uploads', { keyPath: 'id' });
        }
      };
    });
  }

  // 파일 업로드 큐에 추가
  async addToQueue(upload: QueuedUpload) {
    this.queue.push(upload);
    await this.saveQueue();
    this.processQueue();
  }

  // 큐 처리
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const upload = this.queue[0];

    try {
      const storageRef = ref(storage, upload.path);
      const uploadTask = uploadBytesResumable(storageRef, upload.file, upload.metadata);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          upload.onProgress?.(progress);
        },
        (error) => {
          upload.onError?.(error);
          this.isProcessing = false;
          this.processQueue();
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          upload.onComplete?.(downloadURL);
          
          // 성공한 업로드 제거
          this.queue.shift();
          await this.saveQueue();
          
          this.isProcessing = false;
          this.processQueue();
        }
      );
    } catch (error) {
      upload.onError?.(error as Error);
      this.isProcessing = false;
      this.processQueue();
    }
  }

  // 네트워크 상태 변경 시 큐 처리 시작
  handleNetworkChange(online: boolean) {
    if (online) {
      this.processQueue();
    }
  }
}

export const uploadQueue = new UploadQueue(); 