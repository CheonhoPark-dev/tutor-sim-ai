'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { NetworkProvider } from '@/components/providers/NetworkProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NetworkStatus } from '@/components/NetworkStatus';
import { initializePerformance } from '@/config/firebase';
import { useEffect } from 'react';

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initializePerformance();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NetworkProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
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