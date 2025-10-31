'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInvoices } from '@/hooks/use-invoices';
import InvoicePreview from '@/components/invoice-preview';
import { Button } from '@/components/ui/button';
import { Edit, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Invoice } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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
    setTimeout(() => {
        window.print();
    }, 100);
  };

  if (isLoading) {
    return <Skeleton className="h-[842px] w-[595px] mx-auto" />;
  }

  if (!invoice) {
    return <div className="text-center py-20">Invoice not found.</div>;
  }
  
  return (
    <div className="flex flex-col items-center gap-8">
        <div className="w-full max-w-[595px] flex justify-end gap-2 no-print">
            <Button variant="outline" onClick={() => router.push(`/invoices/new`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button onClick={handlePrint} className="bg-accent hover:bg-accent/90">
                <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
            </Button>
        </div>
        <div className="printable-area hidden">
             <InvoicePreview invoice={invoice} />
        </div>
        <div className="w-full">
            <InvoicePreview invoice={invoice} />
        </div>
    </div>
  );
}
