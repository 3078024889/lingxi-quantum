import { NextResponse, type NextRequest } from 'next/server';

/**
 * International-only canonical www redirect.
 * Fixed destination prevents Host header based open redirects.
 * All requests for .cn, workers.dev, and test origins continue unchanged.
 */
export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':', 1)[0].toLowerCase();
  if (host !== 'www.globalsiai.com') return NextResponse.next();

  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://globalsiai.com');
  return NextResponse.redirect(target, 301);
}
export const config = { matcher: '/:path*' };
