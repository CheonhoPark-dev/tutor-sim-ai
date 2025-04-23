import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/common/Button';

export default function ComponentsPage() {
  return (
    <Container className="py-8 space-y-8">
      <Typography variant="h1">컴포넌트 테스트</Typography>

      <section>
        <Typography variant="h2" className="mb-4">카드</Typography>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <Typography variant="h3" className="mb-2">기본 카드</Typography>
            <Typography>기본 스타일의 카드 컴포넌트입니다.</Typography>
          </Card>
          <Card variant="bordered" padding="lg">
            <Typography variant="h3" className="mb-2">테두리가 있는 카드</Typography>
            <Typography>큰 패딩이 적용된 테두리 카드입니다.</Typography>
          </Card>
        </div>
      </section>

      <section>
        <Typography variant="h2" className="mb-4">입력</Typography>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <Input placeholder="기본 입력" />
            <Input placeholder="에러 상태" error />
            <Input placeholder="비활성화" disabled />
          </div>
          <div className="space-y-4">
            <Input placeholder="전체 너비" fullWidth />
            <Input type="password" placeholder="비밀번호" fullWidth />
            <Input type="search" placeholder="검색..." fullWidth />
          </div>
        </div>
      </section>

      <section>
        <Typography variant="h2" className="mb-4">타이포그래피</Typography>
        <div className="space-y-4">
          <Typography variant="h1">제목 1</Typography>
          <Typography variant="h2">제목 2</Typography>
          <Typography variant="h3">제목 3</Typography>
          <Typography variant="h4">제목 4</Typography>
          <Typography variant="h5">제목 5</Typography>
          <Typography variant="h6">제목 6</Typography>
          <Typography>기본 텍스트</Typography>
          <Typography variant="small">작은 텍스트</Typography>
          <Typography variant="large">큰 텍스트</Typography>
        </div>
      </section>

      <section>
        <Typography variant="h2" className="mb-4">버튼과 함께 사용</Typography>
        <Card className="p-6">
          <Typography variant="h4" className="mb-4">로그인</Typography>
          <form className="space-y-4">
            <div>
              <Typography variant="small" className="mb-2">이메일</Typography>
              <Input type="email" placeholder="이메일 주소" fullWidth />
            </div>
            <div>
              <Typography variant="small" className="mb-2">비밀번호</Typography>
              <Input type="password" placeholder="비밀번호" fullWidth />
            </div>
            <Button className="w-full">로그인</Button>
          </form>
        </Card>
      </section>
    </Container>
  );
} 