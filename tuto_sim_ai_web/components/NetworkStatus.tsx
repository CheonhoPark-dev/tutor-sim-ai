'use client';

import React from 'react';
import { useNetwork } from '../contexts/NetworkContext';
import { MdSignalWifi4Bar, MdSignalWifiOff } from 'react-icons/md';
import { BiSync, BiCloudUpload } from 'react-icons/bi';

export const NetworkStatus = () => {
  const { isOnline, isSyncing, pendingUploads, pendingOperations } = useNetwork();

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
      {isOnline ? (
        <>
          <MdSignalWifi4Bar className="text-green-500" />
          <span className="text-sm text-green-500">온라인</span>
          {isSyncing && (
            <BiSync className="text-blue-500 animate-spin ml-2" />
          )}
          {(pendingUploads > 0 || pendingOperations > 0) && (
            <div className="flex items-center ml-2">
              <BiCloudUpload className="text-blue-500" />
              <span className="text-xs text-blue-500 ml-1">
                {pendingUploads + pendingOperations}개 대기 중
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          <MdSignalWifiOff className="text-red-500" />
          <span className="text-sm text-red-500">오프라인</span>
          {(pendingUploads > 0 || pendingOperations > 0) && (
            <div className="flex items-center ml-2">
              <BiCloudUpload className="text-gray-500" />
              <span className="text-xs text-gray-500 ml-1">
                {pendingUploads + pendingOperations}개 대기 중
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};