import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const authenticatedUserId = request.headers.get('x-user-id');
    const authenticatedUserRole = request.headers.get('x-user-role');

    if (!authenticatedUserId || !authenticatedUserRole) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Allow user to fetch their own profile OR if they are an ADMIN
    if (id !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized to view this user' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true }, // Select specific fields to return
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User fetched successfully', user }, { status: 200 });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const authenticatedUserId = request.headers.get('x-user-id');
    const authenticatedUserRole = request.headers.get('x-user-role');

    if (!authenticatedUserId || !authenticatedUserRole) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Allow user to update their own profile OR if they are an ADMIN
    if (id !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized to update this user' }, { status: 403 });
    }

    const { email, name, password } = await request.json();

    const updateData: { email?: string; name?: string; password?: string } = {};

    if (email) {
      updateData.email = email;
    }
    if (name) {
      updateData.name = name;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update provided' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true }, // Select specific fields to return
    });

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
