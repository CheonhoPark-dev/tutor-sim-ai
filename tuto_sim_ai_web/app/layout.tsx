import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';
import { NetworkProvider } from '../contexts/NetworkContext';
import { NetworkStatus } from '../components/NetworkStatus';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '튜토심AI',
  description: '튜토심AI - AI 기반 학습 도우미',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <NetworkProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <NetworkStatus />
              </div>
            </NetworkProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 