import client from 'prom-client';

// 메트릭스 레지스트리 생성
const register = new client.Registry();

// 기본 메트릭스 수집 활성화
client.collectDefaultMetrics({ register });

// API 요청 카운터
export const apiRequestCounter = new client.Counter({
  name: 'gemini_api_requests_total',
  help: 'Total number of Gemini API requests',
  labelNames: ['method', 'path', 'status']
});

// API 응답 시간 히스토그램
export const apiResponseTime = new client.Histogram({
  name: 'gemini_api_response_time_seconds',
  help: 'Response time of Gemini API requests',
  labelNames: ['method', 'path'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// API 오류 카운터
export const apiErrorCounter = new client.Counter({
  name: 'gemini_api_errors_total',
  help: 'Total number of Gemini API errors',
  labelNames: ['method', 'path', 'error_type']
});

// 토큰 사용량 게이지
export const tokenUsageGauge = new client.Gauge({
  name: 'gemini_token_usage_total',
  help: 'Current token usage for Gemini API',
  labelNames: ['model']
});

// 동시 연결 수 게이지
export const concurrentConnectionsGauge = new client.Gauge({
  name: 'gemini_concurrent_connections',
  help: 'Number of concurrent WebSocket connections'
});

// 캐시 히트율 게이지
export const cacheHitRatioGauge = new client.Gauge({
  name: 'gemini_cache_hit_ratio',
  help: 'Cache hit ratio for Gemini API responses'
});

// 레지스트리에 메트릭스 등록
register.registerMetric(apiRequestCounter);
register.registerMetric(apiResponseTime);
register.registerMetric(apiErrorCounter);
register.registerMetric(tokenUsageGauge);
register.registerMetric(concurrentConnectionsGauge);
register.registerMetric(cacheHitRatioGauge);

// 메트릭스 수집 엔드포인트용 핸들러
export async function metricsHandler(): Promise<string> {
  return register.metrics();
} 