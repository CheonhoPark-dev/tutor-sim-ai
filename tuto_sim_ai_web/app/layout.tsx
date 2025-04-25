import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { RootLayoutClient } from './RootLayoutClient';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '튜토심AI - AI 기반 학습 도우미',
  description: 'AI 기반의 맞춤형 학습 도우미 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
} 