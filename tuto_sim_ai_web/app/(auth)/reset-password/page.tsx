'use client';

import ResetPassword from '@/components/auth/ResetPassword';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <ResetPassword />
        <div className="text-center text-sm">
          <Link href="/auth/login" className="text-primary hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 