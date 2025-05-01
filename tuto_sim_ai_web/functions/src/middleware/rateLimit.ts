import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

const WINDOW_SIZE_MS = 60000; // 1분
const MAX_REQUESTS = 100; // 분당 최대 요청 수

interface RateLimitInfo {
  count: number;
  windowStart: number;
}

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user?.uid;
  if (!userId) {
    return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
  }

  const rateLimitRef = admin.firestore()
    .collection('rate_limits')
    .doc(userId);

  try {
    const doc = await rateLimitRef.get();
    const now = Date.now();

    let rateLimit: RateLimitInfo = doc.exists 
      ? doc.data() as RateLimitInfo
      : { count: 0, windowStart: now };

    // 새로운 시간 창이면 초기화
    if (now - rateLimit.windowStart > WINDOW_SIZE_MS) {
      rateLimit = { count: 0, windowStart: now };
    }

    // 제한 확인
    if (rateLimit.count >= MAX_REQUESTS) {
      return res.status(429).json({ 
        error: '요청 한도를 초과했습니다.',
        resetTime: new Date(rateLimit.windowStart + WINDOW_SIZE_MS)
      });
    }

    // 카운터 증가
    await rateLimitRef.set({
      count: rateLimit.count + 1,
      windowStart: rateLimit.windowStart
    });

    next();
  } catch (error) {
    console.error('Rate limit 오류:', error);
    next();
  }
}; 