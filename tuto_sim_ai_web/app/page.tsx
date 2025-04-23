import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Container } from '@/components/ui/Container';

export default function Home() {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
        <Typography variant="h1">Welcome to Our App</Typography>
        <Typography variant="p">This is a sample home page with navigation.</Typography>
        
        <div className="flex gap-4">
          <Link href="/posts/1">
            <Button variant="default">View Post #1</Button>
          </Link>
          <Link href="/posts/2">
            <Button variant="outline">View Post #2</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
} 