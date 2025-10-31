
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const authenticatedUserId = request.headers.get('x-user-id');
    const authenticatedUserRole = request.headers.get('x-user-role');

    if (!authenticatedUserId || !authenticatedUserRole) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { user: true }, // Include the user relation
    });

    if (!expense) {
      return NextResponse.json({ message: 'Expense not found.' }, { status: 404 });
    }

    // Authorization: User can view their own expense or if they are an ADMIN
    if (expense.userId !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized to view this expense.' }, { status: 403 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error(`Failed to read expense ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to load expense.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const authenticatedUserId = request.headers.get('x-user-id');
    const authenticatedUserRole = request.headers.get('x-user-role');

    if (!authenticatedUserId || !authenticatedUserRole) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return NextResponse.json({ message: 'Expense not found.' }, { status: 404 });
    }

    // Authorization: User can update their own expense or if they are an ADMIN
    if (existingExpense.userId !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized to update this expense.' }, { status: 403 });
    }

    const updatedExpenseData = await request.json();

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updatedExpenseData,
      include: { user: true }, // Include the user relation in the response
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error(`Failed to update expense ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to update expense.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const authenticatedUserId = request.headers.get('x-user-id');
    const authenticatedUserRole = request.headers.get('x-user-role');

    if (!authenticatedUserId || !authenticatedUserRole) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      return NextResponse.json({ message: 'Expense not found.' }, { status: 404 });
    }

    // Authorization: User can delete their own expense or if they are an ADMIN
    if (existingExpense.userId !== authenticatedUserId && authenticatedUserRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized to delete this expense.' }, { status: 403 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete expense ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to delete expense.' }, { status: 500 });
  }
}
