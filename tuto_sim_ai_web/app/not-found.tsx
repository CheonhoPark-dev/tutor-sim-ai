import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <Typography variant="h1">404</Typography>
        <Typography variant="h2">Page Not Found</Typography>
        <Typography variant="p">Sorry, we couldn't find the page you're looking for.</Typography>
        <Link href="/">
          <Button variant="default">Return Home</Button>
        </Link>
      </div>
    </Container>
  );
} 