'use client';

import type { Invoice } from '@/lib/types';
import { useEffect, useState } from "react";
import { useToast } from './use-toast';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/invoices");
        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your invoices.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [toast]);

  const addInvoice = async (invoice: Omit<Invoice, "id">) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });
      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }
      const newInvoice = await response.json();
      setInvoices((prev) => [...prev, newInvoice]);
      toast({
        title: "Invoice Created",
        description: "Your new invoice has been saved.",
      });
      return newInvoice;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem creating your invoice.",
      });
      return null;
    }
  };

  const getInvoiceById = (id: string) => {
    return invoices.find((invoice) => invoice.id === id);
  };

  const updateInvoice = async (id: string, updatedInvoiceData: Partial<Omit<Invoice, 'id'>>) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInvoiceData),
      });
      if (!response.ok) {
        throw new Error("Failed to update invoice");
      }
      const updatedInvoice = await response.json();
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? updatedInvoice : inv))
      );
      toast({
        title: "Invoice Updated",
        description: "Your invoice has been successfully updated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem updating your invoice.",
      });
    }
  };
  
  const deleteInvoice = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast({
        title: "Invoice Deleted",
        description: "Your invoice has been deleted.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem deleting your invoice.",
      });
    }
  };

  const backupData = () => {
    if (invoices.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "There is no data to back up.",
      });
      return;
    }
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
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File could not be read.');
        }
        
        const restoredInvoices: Invoice[] = JSON.parse(text);
        if (!Array.isArray(restoredInvoices)) {
          throw new Error("Invalid file format. Expected an array of invoices.");
        }

        const response = await fetch('/api/invoices/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restoredInvoices),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to restore invoices on the server.');
        }

        setInvoices(restoredInvoices);
        toast({
            title: 'Data Restored',
            description: 'Your invoices have been successfully restored and saved to the server.'
        });

      } catch (error) {
        console.error('Failed to restore data', error);
        toast({
            variant: 'destructive',
            title: 'Restore Failed',
            description: (error as Error).message || 'The selected file is not valid or is corrupted.'
        });
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
