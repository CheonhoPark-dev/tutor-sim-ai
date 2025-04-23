import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

export default function PostPage({ params }: { params: { id: string } }) {
  const id = params.id;

  return (
    <Container>
      <div className="py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Typography variant="h1">게시물 #{id}</Typography>
          <Link href="/">
            <Button variant="outline">돌아가기</Button>
          </Link>
        </div>
        
        <Card>
          <div className="p-6 space-y-4">
            <Typography variant="h2">샘플 게시물 제목</Typography>
            <Typography variant="p" className="text-muted-foreground">
              이것은 동적 라우팅 테스트를 위한 샘플 게시물입니다.
              URL의 id 파라미터는 {id} 입니다.
            </Typography>
          </div>
        </Card>

        <div className="flex gap-4">
          <Link href={`/posts/${Number(id) - 1}`}>
            <Button variant="outline" disabled={Number(id) <= 1}>이전 게시물</Button>
          </Link>
          <Link href={`/posts/${Number(id) + 1}`}>
            <Button>다음 게시물</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
} 