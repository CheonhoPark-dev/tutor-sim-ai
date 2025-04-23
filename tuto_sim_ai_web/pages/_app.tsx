import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <main className={inter.className}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </AuthProvider>
  );
} 