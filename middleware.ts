import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (Note: this resets on every server restart/edge function cold start)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 100; // 100 requests
const WINDOW_SIZE = 60 * 60 * 1000; // 1 hour

export async function middleware(request: NextRequest) {
  const session = await auth0.getSession();
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now();
    const limitData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - limitData.lastReset > WINDOW_SIZE) {
      limitData.count = 0;
      limitData.lastReset = now;
    }

    limitData.count++;
    rateLimitMap.set(ip, limitData);

    if (limitData.count > RATE_LIMIT) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  // Protect all routes under /api/resumes
  if (request.nextUrl.pathname.startsWith('/api/resumes')) {
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth0 routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
