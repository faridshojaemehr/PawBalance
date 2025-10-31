
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  const expenseId = searchParams.get('expenseId');

  const authenticatedUserId = request.headers.get('x-user-id');
  const authenticatedUserRole = request.headers.get('x-user-role');

  if (!authenticatedUserId || !authenticatedUserRole) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  if (!filename || !request.body) {
    return NextResponse.json({ message: 'No filename or file body provided.' }, { status: 400 });
  }

  if (!expenseId) {
    return NextResponse.json({ message: 'Expense ID is required.' }, { status: 400 });
  }

  try {
  // Verify if the expense exists and belongs to the authenticated user, or if the user is an ADMIN
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      select: { userId: true },
    });

    if (!expense) {
      return NextResponse.json({ message: 'Expense not found.' }, { status: 404 });
    }

    if (expense.userId !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized to upload file for this expense.' }, { status: 403 });
    }

    const blob = await put(filename, request.body, {
      access: 'public',
    });

    // Update the expense record with the blob URL
    await prisma.expense.update({
      where: { id: expenseId },
      data: { receiptUrl: blob.url }, // Add receiptUrl to ExpenseUncheckedUpdateInput in your Prisma schema
  });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Vercel Blob upload error:', error);
    return NextResponse.json({ message: 'Failed to upload file.', error: error.message }, { status: 500 });
  }
}
