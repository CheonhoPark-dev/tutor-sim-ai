import { Typography } from '@/components/ui/Typography';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container>
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 text-center">
        <Typography variant="h1">404</Typography>
        <Typography variant="h2">페이지를 찾을 수 없습니다</Typography>
        <Typography variant="p">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </Typography>
        <Link href="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </Container>
  );
} 