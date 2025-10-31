
'use client';

import { ExpenseForm } from '@/components/expense-form';
import { useExpenses } from '@/hooks/use-expenses';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditExpensePage() {
  const { getExpenseById, updateExpense, isLoading } = useExpenses();
  const router = useRouter();
  const params = useParams();
  const [expense, setExpense] = useState<Expense | undefined>(undefined);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id && !isLoading) {
      const foundExpense = getExpenseById(id);
      setExpense(foundExpense);
    }
  }, [id, getExpenseById, isLoading]);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    await updateExpense(id, values);
    router.push('/expenses');
  };

  if (isLoading || !expense) {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
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
