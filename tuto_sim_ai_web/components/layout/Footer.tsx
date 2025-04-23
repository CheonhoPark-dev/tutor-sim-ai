import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';

export function Footer() {
  return (
    <footer className="py-6 border-t">
      <Container>
        <div className="flex items-center justify-between">
          <Typography variant="p" className="text-sm text-muted-foreground">
            © 2024 Tutorial Simulator AI. All rights reserved.
          </Typography>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="/docs"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Documentation
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
} 