
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: { user: true }, // Include the user relation
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json({ message: 'Failed to load expenses.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authenticatedUserId = request.headers.get('x-user-id');

    if (!authenticatedUserId) {
      return NextResponse.json({ message: 'Authentication required: User ID not found in headers.' }, { status: 401 });
    }

    const newExpenseData = await request.json();

    const newExpense = await prisma.expense.create({
      data: {
        ...newExpenseData,
        userId: authenticatedUserId,
      },
      include: { user: true }, // Include the user relation in the response
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json({ message: 'Failed to create expense.', error: error.message }, { status: 500 });
  }
}
