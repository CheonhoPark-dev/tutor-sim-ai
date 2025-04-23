'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';

export const ResetPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail(''); // 폼 초기화
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('비밀번호 재설정 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Typography variant="h2" className="mb-2">
          비밀번호 재설정
        </Typography>
        <Typography variant="p" className="text-muted-foreground">
          가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </Typography>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
          disabled={loading}
        />
        
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        
        {success && (
          <div className="text-green-500 text-sm text-center">
            비밀번호 재설정 링크가 이메일로 전송되었습니다.
            메일함을 확인해주세요.
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '처리 중...' : '비밀번호 재설정 링크 받기'}
        </Button>
      </form>
    </div>
  );
}; 