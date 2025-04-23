'use client';

import Link from 'next/link';
import SignUpForm from '@/components/auth/SignUpForm';
import { Container } from '@/components/ui/Container';

export default function RegisterPage() {
  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              회원가입
            </h2>
          </div>
          <SignUpForm />
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
