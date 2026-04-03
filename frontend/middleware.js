/**
 * middleware.js - Route protection via JWT cookie check
 * Runs on Edge Runtime — keep it lightweight
 */

import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];
const AUTH_PATHS = ['/feed', '/notifications', '/bookmarks', '/search'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedPath =
    AUTH_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/profile');

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
