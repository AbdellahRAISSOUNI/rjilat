import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function userAuth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token || token.type !== 'user') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return NextResponse.next();
}

export async function adminAuth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // If no token or not admin, redirect to admin login page
  if (!token || token.type !== 'admin') {
    // For the main /admin route (login page), allow access
    if (req.nextUrl.pathname === '/admin') {
      return NextResponse.next();
    }
    // For all other admin routes, redirect to login
    return NextResponse.redirect(new URL('/admin', req.url));
  }
  
  // If admin is accessing the login page, redirect to dashboard
  if (req.nextUrl.pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }
  
  return NextResponse.next();
}

export async function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected admin routes - all /admin/* paths require admin auth
  if (pathname.startsWith('/admin')) {
    return adminAuth(req);
  }

  // Protected user routes
  if (pathname.startsWith('/home') || pathname.startsWith('/dashboard/home')) {
    return userAuth(req);
  }

  // Redirect authenticated users away from auth pages
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (token) {
    if (pathname === '/login' || pathname === '/register') {
      if (token.type === 'user') {
        return NextResponse.redirect(new URL('/home', req.url));
      } else if (token.type === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    }
  }

  return NextResponse.next();
}
