'use client';

import { useState } from 'react';
import { measureAsyncOperation, CustomTraceType } from '../../lib/performance';
import { initializePerformance } from '../../config/firebase';

export default function TestPerformancePage() {
  const [results, setResults] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runPerformanceTests = async () => {
    setIsRunning(true);
    const performance = initializePerformance();
    
    if (!performance) {
      setResults({
        error: '성능 모니터링을 초기화할 수 없습니다. (클라이언트 사이드에서만 실행 가능)'
      });
      setIsRunning(false);
      return;
    }

    try {
      // API 호출 테스트
      const apiStartTime = Date.now();
      await measureAsyncOperation(
        'api_call_test',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
        },
        { testType: 'api', endpoint: '/api/test' }
      );
      const apiDuration = Date.now() - apiStartTime;
      setResults(prev => ({ ...prev, api: `${apiDuration}ms` }));

      // 데이터 처리 테스트
      const processingStartTime = Date.now();
      await measureAsyncOperation(
        'data_processing_test',
        async () => {
          const arr = Array.from({ length: 100000 }, () => Math.random());
          arr.sort((a, b) => a - b);
        },
        { testType: 'processing', arraySize: 100000 }
      );
      const processingDuration = Date.now() - processingStartTime;
      setResults(prev => ({ ...prev, processing: `${processingDuration}ms` }));

      // 이미지 로딩 테스트
      const imageStartTime = Date.now();
      await measureAsyncOperation(
        'image_load_test',
        async () => {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = 'https://picsum.photos/1000/1000';
          });
        },
        { testType: 'resource', resourceType: 'image' }
      );
      const imageDuration = Date.now() - imageStartTime;
      setResults(prev => ({ ...prev, image: `${imageDuration}ms` }));

    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        error: '테스트 실행 중 오류가 발생했습니다: ' + (error as Error).message 
      }));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">성능 테스트</h1>
      <button
        onClick={runPerformanceTests}
        disabled={isRunning}
        className={`px-4 py-2 rounded ${
          isRunning 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {isRunning ? '테스트 실행 중...' : '테스트 실행'}
      </button>

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">테스트 결과</h2>
        {results.error ? (
          <div className="text-red-500">{results.error}</div>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            <li>
              API 호출 테스트: {results.api || '아직 실행되지 않음'}
              <span className="text-gray-500 ml-2">(2초 지연 시뮬레이션)</span>
            </li>
            <li>
              데이터 처리 테스트: {results.processing || '아직 실행되지 않음'}
              <span className="text-gray-500 ml-2">(100,000개 항목 정렬)</span>
            </li>
            <li>
              이미지 로딩 테스트: {results.image || '아직 실행되지 않음'}
              <span className="text-gray-500 ml-2">(1000x1000 이미지 로드)</span>
            </li>
          </ul>
        )}
        
        <p className="mt-4 text-sm text-gray-600">
          * 상세한 성능 분석은 Firebase Console의 Performance 섹션에서 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
} 