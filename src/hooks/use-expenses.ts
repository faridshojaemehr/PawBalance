
'use client';

import type { Expense } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/expenses');
        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your expenses.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [toast]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!response.ok) {
        throw new Error('Failed to create expense');
      }
      const newExpense = await response.json();
      setExpenses((prev) => [...prev, newExpense]);
      toast({
        title: 'Expense Added',
        description: 'Your new expense has been saved.',
      });
      return newExpense;
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem creating your expense.',
      });
      return null;
    }
  };

  const getExpenseById = (id: string) => {
    return expenses.find((expense) => expense.id === id);
  };

  const updateExpense = async (id: string, updatedExpenseData: Partial<Omit<Expense, 'id'>>) => {
    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedExpenseData),
        });
        if (!response.ok) {
            throw new Error('Failed to update expense');
        }
        const updatedExpense = await response.json();
        setExpenses((prev) => 
            prev.map((exp) => (exp.id === id ? updatedExpense : exp))
        );
        toast({
            title: 'Expense Updated',
            description: 'Your expense has been successfully updated.',
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'There was a problem updating your expense.',
        });
    }
  };
  
  const deleteExpense = async (id: string) => {
    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }
        setExpenses((prev) => prev.filter(exp => exp.id !== id));
        toast({
            title: 'Expense Deleted',
            description: 'Your expense has been deleted.',
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'There was a problem deleting your expense.',
        });
    }
  };

  return {
    expenses,
    isLoading,
    addExpense,
    getExpenseById,
    updateExpense,
    deleteExpense,
  };
}
