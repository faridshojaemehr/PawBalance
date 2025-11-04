import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const authenticatedUserId = request.headers.get('x-user-id');
    const authenticatedUserRole = request.headers.get('x-user-role');

    if (!authenticatedUserId || !authenticatedUserRole) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    if (authenticatedUserRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized to view users' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ message: 'Users fetched successfully', users }, { status: 200 });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
