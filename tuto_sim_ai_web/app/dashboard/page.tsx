import { Button } from '@/components/common/Button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
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
    </div>
  );
} 