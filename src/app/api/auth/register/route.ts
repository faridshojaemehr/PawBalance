import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email: rawEmail, password, name } = await request.json();\n    const email = rawEmail?.trim();\n\n    if (!email || !password) {\n      return NextResponse.json({ message: \'Email and password are required\' }, { status: 400 });\n    }\n\n    // Basic email format validation\n    const emailRegex = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;\n    if (!emailRegex.test(email)) {\n      return NextResponse.json({ message: \'Invalid email format\' }, { status: 400 });\n    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return NextResponse.json({ message: 'User registered successfully', user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
