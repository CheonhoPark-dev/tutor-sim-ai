import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/AuditService';
import { AuditEventType, AuditEventSeverity } from '../types/audit';

export const createAuditMiddleware = (auditService: AuditService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || Math.random().toString(36).substring(7);

    // 원본 응답 메서드들을 저장
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    // 응답 데이터를 캡처하기 위한 변수
    let responseBody: any;

    // send 메서드 오버라이드
    res.send = function (body: any): Response {
      responseBody = body;
      return originalSend.call(this, body);
    };

    // json 메서드 오버라이드
    res.json = function (body: any): Response {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // end 메서드 오버라이드
    const endHandler = function(this: Response, chunk: any, encoding: BufferEncoding | undefined, callback?: () => void): Response {
      if (chunk) {
        responseBody = chunk;
      }
      return originalEnd.call(this, chunk, encoding as BufferEncoding, callback);
    };

    // end 메서드의 타입을 유지하면서 오버라이드
    res.end = endHandler as typeof res.end;

    // 응답이 완료되면 감사 로그 기록
    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      
      try {
        await auditService.logEvent({
          eventType: AuditEventType.API_REQUEST,
          severity: res.statusCode >= 400 ? AuditEventSeverity.ERROR : AuditEventSeverity.INFO,
          userId: (req as any).user?.uid, // Firebase Auth에서 설정된 사용자 ID
          action: `${req.method} ${req.path}`,
          status: res.statusCode < 400 ? 'success' : 'failure',
          details: {
            statusCode: res.statusCode,
            duration,
            query: req.query,
            params: req.params,
            // 민감한 정보는 제외
            body: sanitizeRequestBody(req.body),
            response: sanitizeResponseBody(responseBody)
          },
          metadata: {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            requestId,
            path: req.path,
            method: req.method
          }
        });
      } catch (error) {
        console.error('Failed to create audit log:', error);
      }
    });

    next();
  };
};

// 민감한 정보를 제거하는 유틸리티 함수들
function sanitizeRequestBody(body: any): any {
  if (!body) return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

function sanitizeResponseBody(body: any): any {
  if (!body) return body;
  
  // 응답이 문자열인 경우 (예: HTML)
  if (typeof body === 'string') {
    return body.length > 1000 ? body.substring(0, 1000) + '...' : body;
  }
  
  // 객체인 경우 민감한 정보 제거
  const sanitized = { ...body };
  const sensitiveFields = ['token', 'apiKey', 'secret'];
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // 응답 크기 제한
  return JSON.stringify(sanitized).length > 1000 
    ? { truncated: true, summary: `Response size exceeds 1000 characters` }
    : sanitized;
} 