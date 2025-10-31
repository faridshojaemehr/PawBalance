'use client';

import { useParams, useRouter } from 'next/navigation';
import { useExpenses } from '@/hooks/use-expenses';
import ExpensePreview from '@/components/expense-preview';
import { Button } from '@/components/ui/button';
import { Edit, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    if (!expenseElement) return;

    document.body.classList.add('print-active');

    const canvas = await html2canvas(expenseElement, {
      scale: 4, // Increased scale for better quality
      useCORS: true,
      logging: true,
      windowWidth: expenseElement.scrollWidth,
      windowHeight: expenseElement.scrollHeight,
    });
    
    document.body.classList.remove('print-active');

    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = 210;
    const pdfHeight = 297;

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
    }
    
    pdf.save(`Expense-${expense?.id}.pdf`);
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
    <>
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
    </>
  );
}
