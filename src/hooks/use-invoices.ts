'use client';

import type { Invoice } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const INVOICES_STORAGE_KEY = 'invoices';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    } catch (error) {
      console.error('Failed to parse invoices from localStorage', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    }
  }, [invoices, isLoading]);

  const getNewInvoiceId = useCallback(() => {
    if (invoices.length === 0) {
      return 'INV-001';
    }
    const latestInvoice = invoices.reduce((latest, current) => {
        const latestNum = parseInt(latest.id.split('-')[1], 10);
        const currentNum = parseInt(current.id.split('-')[1], 10);
        return currentNum > latestNum ? current : latest;
    }, invoices[0]);
    
    const lastIdNum = parseInt(latestInvoice.id.split('-')[1], 10);
    const newIdNum = lastIdNum + 1;
    return `INV-${String(newIdNum).padStart(3, '0')}`;
  }, [invoices]);

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: getNewInvoiceId() };
    setInvoices((prev) => [...prev, newInvoice]);
    return newInvoice;
  };

  const bulkAddInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
  };
  
  const getInvoiceById = (id: string) => {
    return invoices.find((invoice) => invoice.id === id);
  };

  const updateInvoice = (id: string, updatedInvoice: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updatedInvoice } : invoice
      )
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  };
  
  return {
    invoices,
    isLoading,
    getNewInvoiceId,
    addInvoice,
    bulkAddInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
  };
}
