
'use client';

import { ExpenseForm } from '@/components/expense-form';
import { useExpenses } from '@/hooks/use-expenses';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewExpensePage() {
  const { addExpense } = useExpenses();
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    const newExpense = await addExpense(values);
    if (newExpense) {
      router.push('/expenses');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseForm onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}
