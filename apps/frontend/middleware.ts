import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/workouts',
  '/progress',
  '/habits',
  '/analytics',
  '/settings',
  '/calendar',
  '/exercises',
  '/weight',
  '/measurements',
  '/templates',
  '/achievements',
  '/notifications',
];

const AUTH_ONLY_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for our JWT cookie — presence means authenticated
  const hasToken = request.cookies.has('access_token');

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  // Unauthenticated user trying to access protected page
  if (isProtected && !hasToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to access login/signup
  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
