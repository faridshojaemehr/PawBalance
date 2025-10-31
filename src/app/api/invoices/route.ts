
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Invoice } from '@/lib/types';

const invoicesFilePath = path.join(process.cwd(), 'data', 'invoices.json');

interface InvoiceData {
  lastInvoiceNumber: number;
  invoices: Invoice[];
}

async function readInvoiceData(): Promise<InvoiceData> {
  try {
    const data = await fs.readFile(invoicesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { lastInvoiceNumber: 0, invoices: [] };
    }
    throw error;
  }
}

async function writeInvoiceData(data: InvoiceData) {
  await fs.writeFile(invoicesFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = await readInvoiceData();
    return NextResponse.json(data.invoices);
  } catch (error) {
    console.error('Failed to read invoices:', error);
    return NextResponse.json({ message: 'Failed to load invoices.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newInvoiceData = await request.json();
    const data = await readInvoiceData();

    const newInvoiceNumber = data.lastInvoiceNumber + 1;
    const paddedInvoiceNumber = String(newInvoiceNumber).padStart(3, '0');

    const newInvoice: Invoice = {
      ...newInvoiceData,
      id: `INV-${paddedInvoiceNumber}`,
    };

    data.invoices.push(newInvoice);
    data.lastInvoiceNumber = newInvoiceNumber;

    await writeInvoiceData(data);

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return NextResponse.json({ message: 'Failed to create invoice.' }, { status: 500 });
  }
}
