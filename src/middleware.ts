
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  
  // Get session from cookies
  const sessionCookie = await cookies().get('__session');

  if (sessionCookie) {
    requestHeaders.set('x-session', sessionCookie.value);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// This config ensures the middleware runs on all admin routes
// and API routes, which is important for server actions.
export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
