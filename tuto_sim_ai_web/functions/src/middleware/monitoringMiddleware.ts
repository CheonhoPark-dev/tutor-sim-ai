import { Request, Response, NextFunction } from 'express';
import {
  apiRequestCounter,
  apiResponseTime,
  apiErrorCounter
} from '../monitoring/metrics';

export const createMonitoringMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const path = req.path;
    const method = req.method;

    // 응답 완료 시 메트릭스 기록
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000; // 초 단위로 변환

      // 요청 카운터 증가
      apiRequestCounter.inc({
        method,
        path,
        status: res.statusCode.toString()
      });

      // 응답 시간 기록
      apiResponseTime.observe(
        {
          method,
          path
        },
        duration
      );

      // 오류 발생 시 카운터 증가
      if (res.statusCode >= 400) {
        apiErrorCounter.inc({
          method,
          path,
          error_type: res.statusCode >= 500 ? 'server_error' : 'client_error'
        });
      }
    });

    next();
  };
}; 