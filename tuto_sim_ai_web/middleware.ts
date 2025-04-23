import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const { pathname } = request.nextUrl;

  // 인증이 필요한 페이지 목록
  const protectedRoutes = ['/dashboard', '/profile'];
  // 인증된 사용자가 접근하면 홈으로 리다이렉트할 페이지 목록
  const authRoutes = ['/login', '/register'];

  // 인증이 필요한 페이지에 접근하려고 할 때
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!authCookie) {
      console.log('[미들웨어] 인증되지 않은 사용자 감지, /login으로 리다이렉션');
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 이미 인증된 사용자가 로그인/회원가입 페이지에 접근하려고 할 때
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (authCookie) {
      console.log('[미들웨어] 인증된 사용자가 로그인 페이지 접근, 홈으로 리다이렉션');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
}; 