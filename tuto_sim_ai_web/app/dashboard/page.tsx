'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { logError } from '@/config/firebase';

export default function DashboardPage() {
  const { user } = useAuth();

  const testErrorReporting = () => {
    try {
      // 여러 종류의 에러 테스트
      const testCases = [
        () => { throw new Error('일반 에러 테스트'); },
        () => { throw new TypeError('타입 에러 테스트'); },
        () => { throw new ReferenceError('참조 에러 테스트'); }
      ];

      // 랜덤하게 하나의 에러 선택
      const randomTest = testCases[Math.floor(Math.random() * testCases.length)];
      randomTest();

    } catch (error) {
      if (error instanceof Error) {
        // Firebase Analytics에 에러 로깅 (추가 정보 포함)
        logError(error, {
          component: 'DashboardPage',
          action: 'testErrorReporting',
          userId: user?.uid || 'anonymous',
          email: user?.email || 'anonymous',
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <Typography variant="h1" className="mb-6">
            대시보드
          </Typography>
          <div className="space-y-4">
            <Typography variant="h2">
              환영합니다, {user?.email}님!
            </Typography>
            <Typography variant="p">
              이곳에서 학습 진행 상황을 확인하고 관리할 수 있습니다.
            </Typography>
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold">환영합니다!</h2>
                <p className="mt-2 text-muted-foreground">AI 학생들과 함께 강의를 연습해보세요.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 새 강의 시작 카드 */}
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                  <h3 className="text-xl font-semibold mb-4">새 강의 시작</h3>
                  <p className="text-muted-foreground mb-4">AI 학생들과 새로운 강의를 시작해보세요.</p>
                  <Link href="/dashboard/lecture/new">
                    <Button className="w-full">강의 시작</Button>
                  </Link>
                </div>

                {/* 강의 기록 카드 */}
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                  <h3 className="text-xl font-semibold mb-4">강의 기록</h3>
                  <p className="text-muted-foreground mb-4">이전 강의 기록을 확인하고 피드백을 검토하세요.</p>
                  <Link href="/dashboard/history">
                    <Button variant="outline" className="w-full">기록 보기</Button>
                  </Link>
                </div>

                {/* 학습 자료 카드 */}
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                  <h3 className="text-xl font-semibold mb-4">학습 자료</h3>
                  <p className="text-muted-foreground mb-4">강의에 사용할 학습 자료를 관리하세요.</p>
                  <Link href="/dashboard/materials">
                    <Button variant="outline" className="w-full">자료 관리</Button>
                  </Link>
                </div>
              </div>

              {/* 에러 테스트 버튼 */}
              <div className="mt-8">
                <Button 
                  variant="destructive" 
                  onClick={testErrorReporting}
                  className="w-full"
                >
                  에러 리포팅 테스트
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 