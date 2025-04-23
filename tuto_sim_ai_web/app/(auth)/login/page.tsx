'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Container } from '@/components/ui/Container';

export default function LoginPage() {
  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              로그인
            </h2>
          </div>
          <LoginForm />
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              계정이 없으신가요?{' '}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
