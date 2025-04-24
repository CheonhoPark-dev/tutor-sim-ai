'use client';

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface SyncOperation {
  id: string;
  collection: string;
  docId: string;
  operation: 'create' | 'update' | 'delete';
  data?: any;
  timestamp: number;
}

class SyncService {
  private pendingOperations: SyncOperation[] = [];
  private isProcessing: boolean = false;

  // 보류 중인 작업 수 반환
  getPendingOperationsCount(): number {
    return this.pendingOperations.length;
  }

  // IndexedDB에서 작업 저장
  private async savePendingOperations() {
    try {
      const db = await this.openDB();
      const tx = db.transaction('syncOperations', 'readwrite');
      const store = tx.objectStore('syncOperations');
      
      await store.clear();
      for (const operation of this.pendingOperations) {
        await store.add(operation);
      }
    } catch (error) {
      console.error('Failed to save pending operations:', error);
    }
  }

  // IndexedDB에서 보류 중인 작업 로드
  private async loadPendingOperations() {
    try {
      const db = await this.openDB();
      const tx = db.transaction('syncOperations', 'readonly');
      const store = tx.objectStore('syncOperations');
      const request = store.getAll();
      
      return new Promise<void>((resolve, reject) => {
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const operations = request.result;
          this.pendingOperations = operations.map(op => ({
            id: op.id,
            collection: op.collection,
            docId: op.docId,
            operation: op.operation,
            data: op.data,
            timestamp: op.timestamp
          }));
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    }
  }

  // IndexedDB 초기화
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('syncService', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('syncOperations')) {
          db.createObjectStore('syncOperations', { keyPath: 'id' });
        }
      };
    });
  }

  // 작업 추가
  async addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp'>) {
    const newOperation: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    this.pendingOperations.push(newOperation);
    await this.savePendingOperations();
    
    if (navigator.onLine) {
      this.processPendingOperations();
    }
  }

  // 충돌 해결
  private async resolveConflict(operation: SyncOperation): Promise<boolean> {
    try {
      const docRef = doc(db, operation.collection, operation.docId);
      const serverDoc = await getDoc(docRef);
      
      if (!serverDoc.exists()) {
        // 서버에 문서가 없으면 충돌 없음
        return true;
      }

      const serverData = serverDoc.data();
      const serverTimestamp = serverData?.timestamp || 0;
      
      // 서버의 데이터가 더 최신이면 클라이언트 작업 취소
      if (serverTimestamp > operation.timestamp) {
        return false;
      }
      
      // 클라이언트 작업이 더 최신이면 진행
      return true;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
    }
  }

  // 보류 중인 작업 처리
  private async processPendingOperations() {
    if (this.isProcessing || this.pendingOperations.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      const operations = [...this.pendingOperations];
      for (const operation of operations) {
        const shouldProcess = await this.resolveConflict(operation);
        
        if (shouldProcess) {
          const docRef = doc(db, operation.collection, operation.docId);
          
          switch (operation.operation) {
            case 'create':
              await setDoc(docRef, { ...operation.data, timestamp: operation.timestamp });
              break;
            case 'update':
              await updateDoc(docRef, { ...operation.data, timestamp: operation.timestamp });
              break;
            case 'delete':
              await setDoc(docRef, { deleted: true, timestamp: operation.timestamp });
              break;
          }
          
          // 성공한 작업 제거
          this.pendingOperations = this.pendingOperations.filter(op => op.id !== operation.id);
        }
      }
      
      await this.savePendingOperations();
    } catch (error) {
      console.error('Error processing pending operations:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // 네트워크 상태 변경 처리
  handleNetworkChange(online: boolean) {
    if (online) {
      this.processPendingOperations();
    }
  }

  // 초기화
  async initialize() {
    await this.loadPendingOperations();
    if (navigator.onLine) {
      this.processPendingOperations();
    }
  }
}

export const syncService = new SyncService(); 