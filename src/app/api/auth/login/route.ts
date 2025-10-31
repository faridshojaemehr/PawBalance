
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const storedUsername = process.env.AUTH_USERNAME;
    const storedPassword = process.env.AUTH_PASSWORD;

    if (!storedUsername || !storedPassword) {
      console.error('Auth environment variables not set');
      return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
    }

    if (username === storedUsername && password === storedPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
