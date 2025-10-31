
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: username } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable not set');
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(jwtSecret));

    // Return token in JSON and set an HttpOnly cookie so server-side requests can authenticate.
    const res = NextResponse.json({ success: true, token }, { status: 200 });
    // Set cookie options: httpOnly, secure in production, sameSite lax, 1 hour maxAge
    res.cookies.set('jwt_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60, // 1 hour
      sameSite: 'lax',
    });

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
