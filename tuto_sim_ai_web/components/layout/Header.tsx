'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">TutoSimAI</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">대시보드</Button>
              </Link>
              <Button variant="outline" onClick={() => signOut()}>
                로그아웃
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button>로그인</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 