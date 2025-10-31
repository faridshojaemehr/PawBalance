'use client';

import { useParams } from 'next/navigation';
import { useInvoices } from '@/hooks/use-invoices';
import InvoiceForm from '@/components/invoice-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { Invoice } from '@/lib/types';

export default function EditInvoicePage() {
  const params = useParams();
  const { getInvoiceById, isLoading } = useInvoices();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id && !isLoading) {
      const foundInvoice = getInvoiceById(id);
      setInvoice(foundInvoice || null);
    }
  }, [id, getInvoiceById, isLoading]);

  if (isLoading) {
    return <Skeleton className="h-[842px] w-[595px] mx-auto" />;
  }

  if (!invoice && !isLoading) {
    return <div className="text-center py-20">Invoice not found.</div>;
  }

  return <InvoiceForm invoice={invoice} />;
}
