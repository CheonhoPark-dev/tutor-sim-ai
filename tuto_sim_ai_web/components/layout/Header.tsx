'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import { Sun, Moon, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          튜토심AI
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <User />
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="ghost">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost">
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 