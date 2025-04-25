# Tuto Sim AI Web

AI 튜토리얼 시뮬레이션 웹 애플리케이션입니다.

## 기술 스택

### 프론트엔드
- Next.js 14
- TypeScript
- Tailwind CSS
- Jest & Testing Library
- ESLint & Prettier

### 백엔드/인프라
- Firebase (Authentication, Firestore, Storage, Functions)
- Google Cloud Speech-to-Text API
- Google Gemini Pro API

## 주요 기능

### 기본 기능
- 실시간 음성/텍스트 기반 강의
- 가상 학생 시스템 (2가지 성향)
  - 호기심 많은 학생
  - 무관심한 학생
- 중학교 수준 맞춤형 상호작용
- 실시간 피드백 시스템
- PDF/이미지 파일 기본 표시 기능

### 향후 추가 예정
- 추가 가상 학생 성향
- 다양한 교육 수준 지원
- 문서 자동 분석 시스템
- 자료 기반 질문 생성

## 시작하기

1. 저장소 클론:
```bash
git clone <repository-url>
cd tuto_sim_ai_web
```

2. 의존성 설치:
```bash
npm install
```

3. 환경 변수 설정:
```bash
cp .env.example .env.local
```

필요한 환경 변수:
- NEXT_PUBLIC_FIREBASE_CONFIG: Firebase 설정
- NEXT_PUBLIC_GEMINI_API_KEY: Gemini API 키
- GOOGLE_CLOUD_CREDENTIALS: Google Cloud 자격 증명 (STT용)

4. 개발 서버 실행:
```bash
npm run dev
```

## 사용 가능한 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션용 빌드
- `npm start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 실행
- `npm run format`: Prettier로 코드 포맷팅
- `npm run type-check`: TypeScript 타입 체크
- `npm test`: 테스트 실행
- `npm run test:watch`: 테스트 감시 모드
- `npm run test:coverage`: 테스트 커버리지 리포트

## 개발 환경 설정

### VS Code 확장 프로그램

다음 확장 프로그램 설치를 권장합니다:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Path Intellisense
- Code Spell Checker
- Color Highlight
- TypeScript Next

### Git Hooks

- pre-commit: 커밋 전 lint-staged 실행 (ESLint, Prettier)

## 프로젝트 구조

```
tuto_sim_ai_web/
├── components/     # 재사용 가능한 컴포넌트
├── contexts/       # React Context
├── hooks/         # 커스텀 훅
├── pages/         # 페이지 컴포넌트
├── public/        # 정적 파일
├── styles/        # 글로벌 스타일
├── lib/           # 유틸리티 및 API 클라이언트
│   ├── gemini/    # Gemini API 관련 코드
│   ├── stt/       # Speech-to-Text 관련 코드
│   └── firebase/  # Firebase 관련 코드
├── tests/         # 테스트 파일
└── types/         # TypeScript 타입 정의
```

## 테스트

Jest와 React Testing Library를 사용하여 테스트를 작성합니다:

```bash
# 전체 테스트 실행
npm test

# 감시 모드로 테스트 실행
npm run test:watch

# 테스트 커버리지 확인
npm run test:coverage
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
