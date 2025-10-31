

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Expense } from '@/lib/types';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  itemName: z.string().min(2, { message: 'Item name must be at least 2 characters.' }),
  vendor: z.string().min(2, { message: 'Vendor must be at least 2 characters.' }),
  purchaseDate: z.date(),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  description: z.string().optional(),
  receiptUrl: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  onSubmit: (values: Omit<Expense, 'id'>) => Promise<void>;
  initialData?: Expense;
}

export function ExpenseForm({ onSubmit, initialData }: ExpenseFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const receiptFileRef = useRef<HTMLInputElement>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        purchaseDate: new Date(initialData.purchaseDate),
        amount: Number(initialData.amount),
        description: initialData.description || '',
    } : {
        itemName: '',
        vendor: '',
        purchaseDate: new Date(),
        category: '',
        amount: 0,
        description: '',
        receiptUrl: '',
    },
  });

  const handleSubmit = async (values: ExpenseFormValues) => {
    try {
      let receiptUrl = initialData?.receiptUrl || '';

      const file = receiptFileRef.current?.files?.[0];

      if (file) {
        setIsUploading(true);
        const response = await fetch(`/api/expenses/upload?filename=${file.name}`, {
          method: 'POST',
          body: file,
        });

        if (!response.ok) {
          throw new Error('Failed to upload receipt.');
        }

        const newBlob = await response.json();
        receiptUrl = newBlob.url;
        toast({ title: 'Receipt uploaded successfully!' });
      }

      await onSubmit({
        ...values,
        purchaseDate: values.purchaseDate.toISOString(),
        receiptUrl,
      });

    } catch (error) {
      console.error('Form submission error:', error);
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., MacBook Pro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vendor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Apple Store" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Purchase Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Hardware" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">€</span>
                  <Input type="number" placeholder="e.g., 2499.99" className="pl-7" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Details about the expense" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>Receipt</FormLabel>
            <FormControl>
                <Input type="file" ref={receiptFileRef} />
            </FormControl>
            <FormDescription>
                Attach an image or PDF of the receipt.
            </FormDescription>
            {initialData?.receiptUrl && (
                <div className="text-sm text-muted-foreground mt-2">
                    <a href={initialData.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                        <Paperclip className="h-4 w-4" />
                        View Current Receipt
                    </a>
                </div>
            )}
        </FormItem>

        <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
          {isUploading ? 'Uploading Receipt...' : (initialData ? 'Save Changes' : 'Create Expense')}
        </Button>
      </form>
    </Form>
  );
}
