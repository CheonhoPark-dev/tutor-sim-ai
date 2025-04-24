'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onSnapshot, enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadQueue } from '../lib/uploadQueue';
import { syncService } from '../lib/syncService';

interface NetworkContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingUploads: number;
  pendingOperations: number;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isSyncing: false,
  pendingUploads: 0,
  pendingOperations: 0
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [pendingOperations, setPendingOperations] = useState(0);

  useEffect(() => {
    // 네트워크 상태 변경 감지
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      
      try {
        // Firestore 네트워크 활성화
        await enableNetwork(db);
        
        // 업로드 큐와 동기화 서비스에 온라인 상태 알림
        uploadQueue.handleNetworkChange(true);
        syncService.handleNetworkChange(true);
        
        // 동기화 완료 후 상태 업데이트
        setTimeout(() => setIsSyncing(false), 2000);
      } catch (error) {
        console.error('Error handling online state:', error);
        setIsSyncing(false);
      }
    };

    const handleOffline = async () => {
      setIsOnline(false);
      setIsSyncing(false);
      
      try {
        // Firestore 네트워크 비활성화
        await disableNetwork(db);
      } catch (error) {
        console.error('Error handling offline state:', error);
      }
    };

    // 초기 상태 설정
    setIsOnline(navigator.onLine);
    
    // 이벤트 리스너 등록
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 서비스 초기화
    syncService.initialize().catch(console.error);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 보류 중인 작업 모니터링
  useEffect(() => {
    const interval = setInterval(() => {
      // 업로드 큐와 동기화 작업 상태 업데이트
      setPendingUploads(uploadQueue.getQueueLength?.() || 0);
      setPendingOperations(syncService.getPendingOperationsCount?.() || 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, isSyncing, pendingUploads, pendingOperations }}>
      {children}
    </NetworkContext.Provider>
  );
}; 