import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Prefer Authorization header, but fall back to an HttpOnly cookie named `jwt_token`.
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  let token = authHeader;
  if (!token) {
    // request.cookies.get may return a cookie object with a `value` property
    token = request.cookies?.get?.('jwt_token')?.value || undefined;
  }

  // Allow access to login and register routes without a token
  if (request.nextUrl.pathname.startsWith('/api/auth/login') || request.nextUrl.pathname.startsWith('/api/auth/register')) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable not set');
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
    const decodedToken = payload as { userId: string; email: string; role: string };

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decodedToken.userId);
    requestHeaders.set('x-user-role', decodedToken.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/users/:path*', '/api/expenses/:path*', '/api/invoices/:path*'],
};
