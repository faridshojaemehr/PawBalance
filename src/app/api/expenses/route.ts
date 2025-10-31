
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

export async function GET() {
  try {
    const data = await readExpenseData();
    return NextResponse.json(data.expenses);
  } catch (error) {
    console.error('Failed to read expenses:', error);
    return NextResponse.json({ message: 'Failed to load expenses.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newExpenseData = await request.json();
    const data = await readExpenseData();

    const newExpenseNumber = data.lastExpenseNumber + 1;
    const paddedExpenseNumber = String(newExpenseNumber).padStart(3, '0');

    const newExpense: Expense = {
      ...newExpenseData,
      id: `EXP-${paddedExpenseNumber}`,
    };

    data.expenses.push(newExpense);
    data.lastExpenseNumber = newExpenseNumber;

    await writeExpenseData(data);

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json({ message: 'Failed to create expense.' }, { status: 500 });
  }
}
