'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="py-4 border-b">
      <Container>
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Tutorial Simulator AI
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/posts/1">
              <Button variant="ghost">Posts</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  );
} 