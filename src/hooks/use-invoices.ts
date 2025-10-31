'use client';

import type { Invoice } from '@/lib/types';
import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export function useInvoices() {
  const firestore = useFirestore();
  const invoicesCollection = useMemo(() => firestore ? collection(firestore, 'invoices') : null, [firestore]);
  const { data: invoices, loading: isLoading } = useCollection(invoicesCollection);

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    if (!invoicesCollection) throw new Error("Firestore not initialized");
    
    const docRef = await addDoc(invoicesCollection, invoice);
    return { ...invoice, id: docRef.id };
  };
  
  const getInvoiceById = (id: string) => {
    return invoices?.find((invoice) => invoice.id === id);
  };

  const updateInvoice = async (id: string, updatedInvoice: Partial<Omit<Invoice, 'id'>>) => {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'invoices', id);
    await updateDoc(docRef, updatedInvoice);
  };

  const deleteInvoice = async (id: string) => {
    if (!firestore) throw new Error("Firestore not initialized");
    const docRef = doc(firestore, 'invoices', id);
    await deleteDoc(docRef);
  };
  
  return {
    invoices: invoices || [],
    isLoading,
    addInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
  };
}
