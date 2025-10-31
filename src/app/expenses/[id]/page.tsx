'use client';

import { useParams, useRouter } from 'next/navigation';
import { useExpenses } from '@/hooks/use-expenses';
import ExpensePreview from '@/components/expense-preview';
import { Button } from '@/components/ui/button';
import { Edit, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExpensePage() {
  const params = useParams();
  const router = useRouter();
  const { getExpenseById, isLoading } = useExpenses();
  const [expense, setExpense] = useState<Expense | undefined>(undefined);
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id && !isLoading) {
      const foundExpense = getExpenseById(id);
      setExpense(foundExpense);
    }
  }, [id, getExpenseById, isLoading]);
  
  const handlePrint = async () => {
    const expenseElement = document.getElementById('expense-preview-container');
    console.log("Expense Element:", expenseElement); // Log the element

    if (!expenseElement) {
      console.error("Expense preview container not found.");
      return;
    }

    // Dynamically import html2pdf.js
    const html2pdf = (await import('html2pdf.js')).default;

    document.body.classList.add('print-active');

    const options: any = {
      margin: 10,
      filename: `Expense-${expense?.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 4, useCORS: true }, // Use scale 4 for better quality, as in original
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Handle page breaks
    };

    try {
      await html2pdf().set(options).from(expenseElement).save();
      console.log("PDF generated successfully.");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      document.body.classList.remove('print-active');
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center gap-8">
            <Skeleton className="h-16 w-full max-w-[800px]" />
            <Skeleton className="h-[842px] w-[595px]" />
        </div>
    );
  }

  if (!expense && !isLoading) {
    return <div className="text-center py-20">Expense not found.</div>;
  }
  
  if (!expense) {
      return (
        <div className="flex flex-col items-center gap-8">
            <Skeleton className="h-16 w-full max-w-[800px]" />
            <Skeleton className="h-[842px] w-[595px]" />
        </div>
      )
  }

  return (
    <div className="max-w-[1200px] mx-auto">
        <div className="no-print w-full max-w-[800px] mx-auto flex justify-end gap-2 mb-8">
            <Button variant="outline" onClick={() => router.push(`/expenses/${expense.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button onClick={handlePrint} className="bg-accent hover:bg-accent/90">
                <Printer className="mr-2 h-4 w-4" /> Save as PDF
            </Button>
        </div>
        <div id="expense-preview-container" className="flex justify-center">
            <ExpensePreview expense={expense} />
        </div>
    </div>
  );
}
