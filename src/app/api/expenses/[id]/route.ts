
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Expense } from '@/lib/types';

const expensesFilePath = path.join(process.cwd(), 'data', 'expenses.json');

interface ExpenseData {
  lastExpenseNumber: number;
  expenses: Expense[];
}

async function readExpenseData(): Promise<ExpenseData> {
  try {
    const data = await fs.readFile(expensesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { lastExpenseNumber: 0, expenses: [] };
    }
    throw error;
  }
}

async function writeExpenseData(data: ExpenseData) {
  await fs.writeFile(expensesFilePath, JSON.stringify(data, null, 2));
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await readExpenseData();
    const expense = data.expenses.find(exp => exp.id === params.id);

    if (expense) {
      return NextResponse.json(expense);
    } else {
      return NextResponse.json({ message: 'Expense not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to read expense ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to load expense.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updatedExpenseData = await request.json();
    const data = await readExpenseData();
    
    const expenseIndex = data.expenses.findIndex(exp => exp.id === params.id);

    if (expenseIndex === -1) {
      return NextResponse.json({ message: 'Expense not found.' }, { status: 404 });
    }

    data.expenses[expenseIndex] = { ...data.expenses[expenseIndex], ...updatedExpenseData, id: params.id };
    await writeExpenseData(data);

    return NextResponse.json(data.expenses[expenseIndex]);
  } catch (error) {
    console.error(`Failed to update expense ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to update expense.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await readExpenseData();
    const expenseExists = data.expenses.some(exp => exp.id === params.id);

    if (!expenseExists) {
      return NextResponse.json({ message: 'Expense not found.' }, { status: 404 });
    }

    data.expenses = data.expenses.filter(exp => exp.id !== params.id);
    await writeExpenseData(data);

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete expense ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to delete expense.' }, { status: 500 });
  }
}
