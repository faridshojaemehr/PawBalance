'use client';

import { useParams, useRouter } from 'next/navigation';
import { useExpenses } from '@/hooks/use-expenses';
import { ExpenseForm } from '@/components/expense-form';
import { useEffect, useState } from 'react';
import type { Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const { getExpenseById, updateExpense, isLoading } = useExpenses();
  const [expense, setExpense] = useState<Expense | undefined>(undefined);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id && !isLoading) {
      const foundExpense = getExpenseById(id);
      setExpense(foundExpense);
    }
  }, [id, getExpenseById, isLoading]);

  const handleSubmit = async (values: Omit<Expense, 'id'>) => {
    if (id) {
      await updateExpense(id, values);
      router.push(`/expenses/${id}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Expense...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!expense && !isLoading) {
    return <div className="text-center py-20">Expense not found.</div>;
  }

  if (!expense) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Expense...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseForm onSubmit={handleSubmit} initialData={expense} />
      </CardContent>
    </Card>
  );
}