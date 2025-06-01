import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { AuthGuard } from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
  title: 'Learning Platform',
  description: 'Real-time interactive learning platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Only guard non-auth pages
  const isBrowser = typeof window !== 'undefined';
  let isAuthPage = false;
  if (isBrowser) {
    const path = window.location.pathname;
    isAuthPage = path.startsWith('/login') || path.startsWith('/register');
  }
  return (
    <html lang="en" data-theme="light">
      <body>
        {isAuthPage ? (
          <Providers>{children}</Providers>
        ) : (
          <AuthGuard>
            <Providers>{children}</Providers>
          </AuthGuard>
        )}
      </body>
    </html>
  );
}
