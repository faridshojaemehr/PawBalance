'use client';

import type { Invoice } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    } catch (error) {
      console.error('Failed to parse invoices from localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load your saved invoices.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveInvoicesToStorage = useCallback((invoicesToSave: Invoice[]) => {
    try {
      const invoicesJson = JSON.stringify(invoicesToSave);
      localStorage.setItem('invoices', invoicesJson);
    } catch (error) {
      console.error('Failed to save invoices to localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your changes.',
      });
    }
  }, [toast]);

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: `INV-${Date.now()}` };
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    saveInvoicesToStorage(updatedInvoices);
    return newInvoice;
  };

  const getInvoiceById = (id: string) => {
    return invoices.find((invoice) => invoice.id === id);
  };

  const updateInvoice = async (id: string, updatedInvoiceData: Partial<Omit<Invoice, 'id'>>) => {
    const updatedInvoices = invoices.map((inv) =>
      inv.id === id ? { ...inv, ...updatedInvoiceData, id } : inv
    );
    setInvoices(updatedInvoices);
    saveInvoicesToStorage(updatedInvoices);
  };
  
  const deleteInvoice = async (id: string) => {
    const updatedInvoices = invoices.filter(inv => inv.id !== id);
    setInvoices(updatedInvoices);
    saveInvoicesToStorage(updatedInvoices);
  };

  const backupData = () => {
    const dataStr = JSON.stringify(invoices, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'invoices-backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const restoreData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const restoredInvoices = JSON.parse(text);
          // Basic validation
          if (Array.isArray(restoredInvoices)) {
            setInvoices(restoredInvoices);
            saveInvoicesToStorage(restoredInvoices);
            toast({
                title: 'Data Restored',
                description: 'Your invoices have been successfully restored.'
            })
          } else {
            throw new Error("Invalid file format");
          }
        }
      } catch (error) {
        console.error('Failed to restore data', error);
        toast({
            variant: 'destructive',
            title: 'Restore Failed',
            description: 'The selected file is not valid JSON or is corrupted.'
        })
      }
    };
    reader.readAsText(file);
  };

  return {
    invoices,
    isLoading,
    addInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    backupData,
    restoreData,
  };
}
