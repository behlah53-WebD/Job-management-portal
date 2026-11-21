import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Explicit bypass for PWA and public static assets
    if (
      pathname.startsWith('/sw.js') ||
      pathname.startsWith('/swe-worker-') ||
      pathname.startsWith('/workbox-') ||
      pathname.startsWith('/manifest') ||
      pathname.startsWith('/offline') ||
      pathname.startsWith('/icons') ||
      pathname.startsWith('/splash') ||
      pathname.startsWith('/screenshots')
    ) {
      return NextResponse.next();
    }

    const token = req.nextauth?.token;
    const role = token?.role;

    // Direct /dashboard route redirection based on session token role
    if (pathname === '/dashboard') {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard/admin', req.url));
      }
      if (role === 'employer') {
        return NextResponse.redirect(new URL('/dashboard/employer', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard/seeker', req.url));
    }

    // Route protections based on role
    if (pathname.startsWith('/dashboard/admin')) {
      if (role !== 'admin') {
        if (role === 'employer') {
          return NextResponse.redirect(new URL('/dashboard/employer', req.url));
        }
        return NextResponse.redirect(new URL('/dashboard/seeker', req.url));
      }
    }

    if (pathname.startsWith('/dashboard/employer')) {
      if (role !== 'employer' && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/seeker', req.url));
      }
    }

    if (pathname.startsWith('/dashboard/seeker')) {
      if (role !== 'jobseeker' && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/employer', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Dashboard routes require token
        if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
