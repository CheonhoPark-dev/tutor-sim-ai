# TutorSim.AI 모니터링 설정 가이드

## Firebase 성능 모니터링

### 설정된 커스텀 트레이스
- `lecture_load`: 강의 로딩 시간 측정
- `student_profile_load`: 학생 프로필 로딩 시간 측정
- `feedback_generation`: AI 피드백 생성 시간 측정
- `material_upload`: 학습 자료 업로드 시간 측정
- `search_execution`: 검색 실행 시간 측정

### 사용 방법
```typescript
// 비동기 작업 측정
await measureAsyncOperation('lecture_load', async () => {
  // 작업 수행
});

// 컴포넌트 성능 추적
const TrackedComponent = withPerformanceTracking('lecture_load')(YourComponent);
```

## Firebase Analytics

### 설정된 이벤트
- `lecture_start`: 강의 시작
- `lecture_complete`: 강의 완료
- `feedback_received`: 피드백 수신
- `student_created`: 가상 학생 생성
- `material_upload`: 자료 업로드
- `search_performed`: 검색 수행
- `error_occurred`: 오류 발생

### 사용자 속성
- `userRole`: 사용자 역할 (교사/관리자)
- `preferredSubjects`: 선호 과목
- `experienceLevel`: 경험 수준
- `activeStudents`: 활성 학생 수

### 사용 방법
```typescript
// 이벤트 로깅
logAnalyticsEvent('lecture_start', {
  lectureId: 'lecture-123',
  subject: 'mathematics'
});

// 사용자 속성 설정
setAnalyticsUserProperties({
  userRole: 'teacher',
  experienceLevel: 'intermediate'
});
```

## 크래시 리포팅

### 설정된 에러 추적
- 전역 에러 핸들링
- 처리되지 않은 Promise 거부
- React 컴포넌트 에러

### 사용 방법
```typescript
// 에러 바운더리 사용
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// 수동 에러 로깅
logErrorToAnalytics('custom_error', '오류 메시지', {
  userId: 'user-123',
  location: 'lecture-page'
});
```

## 대시보드 설정

### Firebase Console에서 대시보드 설정
1. Firebase Console 접속
2. 프로젝트 선택
3. "모니터링" 섹션으로 이동
4. "대시보드" 탭 선택
5. "사용자 정의 대시보드 만들기" 클릭

### 추천 대시보드 위젯
1. 사용자 참여도
   - DAU/MAU
   - 세션 지속 시간
   - 이탈률

2. 성능 메트릭
   - 페이지 로드 시간
   - API 응답 시간
   - 리소스 로드 시간

3. 오류 추적
   - 크래시 발생률
   - 오류 유형별 분포
   - 영향받은 사용자 수

4. 비즈니스 메트릭
   - 강의 완료율
   - 피드백 생성 횟수
   - 학생 생성 횟수

### 알림 설정
1. 성능 저하 알림
   - 페이지 로드 시간 > 3초
   - API 응답 시간 > 1초
   - 오류율 > 1%

2. 사용자 행동 알림
   - 비정상적인 사용자 이탈
   - 높은 오류 발생률
   - 중요 기능 사용 감소

## 모니터링 체크리스트

### 일일 체크
- [ ] 크래시 리포트 확인
- [ ] 성능 메트릭 검토
- [ ] 사용자 활동 검토

### 주간 체크
- [ ] 트렌드 분석
- [ ] 성능 최적화 기회 식별
- [ ] 오류 패턴 분석

### 월간 체크
- [ ] 대시보드 구성 검토
- [ ] 알림 임계값 조정
- [ ] 성능 개선 계획 수립 