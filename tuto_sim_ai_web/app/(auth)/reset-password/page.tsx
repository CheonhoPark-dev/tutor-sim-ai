'use client';

import { Card } from '@/components/ui/Card';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <ResetPasswordForm />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 