'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInvoices } from '@/hooks/use-invoices';
import InvoicePreview from '@/components/invoice-preview';
import { Button } from '@/components/ui/button';
import { Edit, Printer, FileDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Invoice } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import * as XLSX from 'xlsx';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { getInvoiceById, isLoading } = useInvoices();
  const [invoice, setInvoice] = useState<Invoice | undefined>(undefined);
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id && !isLoading) {
      const foundInvoice = getInvoiceById(id);
      setInvoice(foundInvoice);
    }
  }, [id, getInvoiceById, isLoading]);
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    if (!invoice) return;

    const itemsData = invoice.items.map(item => ({
      Description: item.description,
      Quantity: item.quantity,
      'Unit Price': item.price,
      Total: item.quantity * item.price,
    }));

    const subtotal = itemsData.reduce((acc, item) => acc + item.Total, 0);
    const tax = subtotal * ((invoice.taxRate || 0) / 100);
    const total = subtotal + tax;
    
    const summaryData = [
        { Item: 'Subtotal', Amount: subtotal },
        { Item: `Tax (${invoice.taxRate || 0}%)`, Amount: tax },
        { Item: 'Total', Amount: total },
    ];

    const clientInfo = [
        { Info: 'Invoice #', Value: invoice.id },
        { Info: 'Client Name', Value: invoice.client.name },
        { Info: 'Client Email', Value: invoice.client.email },
        { Info: 'Due Date', Value: invoice.dueDate },
    ]

    const itemsSheet = XLSX.utils.json_to_sheet(itemsData);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });
    const clientSheet = XLSX.utils.json_to_sheet(clientInfo, { skipHeader: true });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, clientSheet, 'Client Info');
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Invoice Items');
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    XLSX.writeFile(workbook, `Invoice-${invoice.id}.xlsx`);
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center gap-8">
            <Skeleton className="h-16 w-full max-w-[595px]" />
            <Skeleton className="h-[842px] w-[595px]" />
        </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-20">Invoice not found.</div>;
  }
  
  return (
    <>
        <div className="no-print w-full max-w-[800px] mx-auto flex justify-end gap-2 mb-8">
            <Button variant="outline" onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button onClick={handleDownloadExcel}>
                <FileDown className="mr-2 h-4 w-4" /> Download as Excel
            </Button>
            <Button onClick={handlePrint} className="bg-accent hover:bg-accent/90">
                <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
            </Button>
        </div>
        <div id="invoice-preview" className="flex justify-center">
            <InvoicePreview invoice={invoice} />
        </div>
    </>
  );
}
