
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Invoice } from '@/lib/types';

const invoicesFilePath = path.join(process.cwd(), 'data', 'invoices.json');

interface InvoiceData {
  lastInvoiceNumber: number;
  invoices: Invoice[];
}

async function writeInvoiceData(data: InvoiceData) {
  await fs.writeFile(invoicesFilePath, JSON.stringify(data, null, 2));
}

export async function POST(request: Request) {
  try {
    const invoicesToRestore: Invoice[] = await request.json();

    if (!Array.isArray(invoicesToRestore)) {
      return NextResponse.json({ message: 'Invalid data format. Expected an array of invoices.' }, { status: 400 });
    }

    // Find the highest invoice number from the restored data to reset the counter
    let maxInvoiceNumber = 0;
    for (const invoice of invoicesToRestore) {
      const match = invoice.id.match(/^INV-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxInvoiceNumber) {
          maxInvoiceNumber = num;
        }
      }
    }

    const newData: InvoiceData = {
      lastInvoiceNumber: maxInvoiceNumber,
      invoices: invoicesToRestore,
    };

    await writeInvoiceData(newData);

    return NextResponse.json({ message: 'Invoices restored successfully.' });

  } catch (error) {
    console.error('Failed to restore invoices:', error);
    return NextResponse.json({ message: 'Failed to restore invoices.' }, { status: 500 });
  }
}
