import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6 bg-card rounded-lg border shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold">로그인</h2>
          <p className="mt-2 text-muted-foreground">AI Tutorial Simulator에 오신 것을 환영합니다</p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="이메일을 입력하세요"
              required
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <Button className="w-full" size="lg">
            로그인
          </Button>
        </form>
      </div>
    </div>
  );
} 