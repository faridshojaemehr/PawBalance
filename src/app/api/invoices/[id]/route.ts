
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await readInvoiceData();
    const invoice = data.invoices.find(inv => inv.id === params.id);

    if (invoice) {
      return NextResponse.json(invoice);
    } else {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to read invoice ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to load invoice.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updatedInvoiceData = await request.json();
    const data = await readInvoiceData();
    
    const invoiceIndex = data.invoices.findIndex(inv => inv.id === params.id);

    if (invoiceIndex === -1) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }

    data.invoices[invoiceIndex] = { ...data.invoices[invoiceIndex], ...updatedInvoiceData, id: params.id };
    await writeInvoiceData(data);

    return NextResponse.json(data.invoices[invoiceIndex]);
  } catch (error) {
    console.error(`Failed to update invoice ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to update invoice.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await readInvoiceData();
    const invoiceExists = data.invoices.some(inv => inv.id === params.id);

    if (!invoiceExists) {
      return NextResponse.json({ message: 'Invoice not found.' }, { status: 404 });
    }

    data.invoices = data.invoices.filter(inv => inv.id !== params.id);
    await writeInvoiceData(data);

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete invoice ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to delete invoice.' }, { status: 500 });
  }
}
