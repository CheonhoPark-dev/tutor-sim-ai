'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useEffect } from 'react';
import { initializePerformance } from '@/config/firebase';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 성능 모니터링 초기화 (클라이언트 사이드에서만)
    initializePerformance();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <NetworkProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <NetworkStatus />
          </div>
        </NetworkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 