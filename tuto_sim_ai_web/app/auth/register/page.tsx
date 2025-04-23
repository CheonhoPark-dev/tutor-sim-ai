import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6 bg-card rounded-lg border shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold">회원가입</h2>
          <p className="mt-2 text-muted-foreground">AI Tutorial Simulator 계정 만들기</p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              label="이름"
              type="text"
              placeholder="이름을 입력하세요"
              required
            />
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
            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
          <Button className="w-full" size="lg">
            회원가입
          </Button>
        </form>
      </div>
    </div>
  );
} 