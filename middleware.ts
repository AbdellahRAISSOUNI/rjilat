import { NextRequest } from 'next/server';
import { authMiddleware } from './src/lib/middleware';

export function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: [
    '/home/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ]
};
