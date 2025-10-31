'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Save, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInvoices } from '@/hooks/use-invoices';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import type { Invoice } from '@/lib/types';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
});

const paymentDetailsSchema = z.object({
  iban: z.string().optional(),
  accountName: z.string().optional(),
  bankName: z.string().optional(),
});

const formSchema = z.object({
  sender: z.object({
    name: z.string().min(1, 'Sender name is required'),
    email: z.string().email('Invalid email address'),
    address: addressSchema,
  }),
  client: z.object({
    name: z.string().min(1, 'Client name is required'),
    email: z.string().email('Invalid email address'),
    address: addressSchema,
  }),
  invoiceDate: z.date(),
  dueDate: z.date(),
  status: z.enum(['paid', 'unpaid', 'draft']),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  taxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').optional(),
  paymentDetails: paymentDetailsSchema.optional(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
}

export default function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addInvoice, updateInvoice, getNewInvoiceId } = useInvoices();
  const newInvoiceId = getNewInvoiceId();
  const isEditing = !!invoice;

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sender: { name: '', email: '', address: { street: '', city: '', state: '', zip: '' } },
      client: { name: '', email: '', address: { street: '', city: '', state: '', zip: '' } },
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: 'draft',
      items: [{ description: '', quantity: 1, price: 0 }],
      notes: '',
      taxRate: 0,
      paymentDetails: { iban: '', accountName: '', bankName: '' },
    },
  });
  
  useEffect(() => {
    if (invoice) {
      form.reset({
        ...invoice,
        invoiceDate: new Date(invoice.invoiceDate),
        dueDate: new Date(invoice.dueDate),
        items: invoice.items.map(item => ({...item})) // remove id
      });
    }
  }, [invoice, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchItems = form.watch('items');
  const watchTaxRate = form.watch('taxRate');
  
  const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
  const tax = subtotal * ((watchTaxRate || 0) / 100);
  const total = subtotal + tax;
  
  function onSubmit(data: InvoiceFormValues) {
    const invoiceData = {
        ...data,
        invoiceDate: data.invoiceDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
    };
    if (isEditing && invoice) {
        updateInvoice(invoice.id, invoiceData);
        toast({
            title: 'Invoice Updated!',
            description: `Invoice ${invoice.id} has been successfully updated.`,
        });
        router.push(`/invoices/${invoice.id}`);
    } else {
        const newInvoice = addInvoice(invoiceData);
        toast({
            title: 'Invoice Saved!',
            description: `Invoice ${newInvoice.id} has been successfully created.`,
        });
        router.push(`/invoices/${newInvoice.id}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{isEditing ? `Edit Invoice (${invoice?.id})` : `New Invoice (${newInvoiceId})`}</h1>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
                <Save className="mr-2 h-4 w-4" /> {isEditing ? 'Update Invoice' : 'Save Invoice'}
            </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle>From</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField name="sender.name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="sender.email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="sender.address.street" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-3 gap-4">
                <FormField name="sender.address.city" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="sender.address.state" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="sender.address.zip" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>ZIP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Bill To</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField name="client.name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="client.email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="client.address.street" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-3 gap-4">
                <FormField name="client.address.city" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="client.address.state" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="client.address.zip" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>ZIP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8">
                <FormField name="status" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )} />
                <FormField name="invoiceDate" control={form.control} render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Invoice Date</FormLabel>
                    <Popover><PopoverTrigger asChild>
                        <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent></Popover>
                    <FormMessage /></FormItem>
                )} />
                 <FormField name="dueDate" control={form.control} render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Due Date</FormLabel>
                    <Popover><PopoverTrigger asChild>
                        <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent></Popover>
                    <FormMessage /></FormItem>
                )} />
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-5">
                    {index === 0 && <FormLabel>Description</FormLabel>}
                    <FormField name={`items.${index}.description`} control={form.control} render={({ field }) => (
                      <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <FormLabel>Quantity</FormLabel>}
                    <FormField name={`items.${index}.quantity`} control={form.control} render={({ field }) => (
                      <FormItem><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                   <div className="col-span-2">
                    {index === 0 && <FormLabel>Price</FormLabel>}
                    <FormField name={`items.${index}.price`} control={form.control} render={({ field }) => (
                      <FormItem><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="col-span-2">
                     {index === 0 && <FormLabel>Total</FormLabel>}
                     <p className="pt-2 font-medium">${((watchItems[index]?.quantity || 0) * (watchItems[index]?.price || 0)).toFixed(2)}</p>
                  </div>
                  <div className="col-span-1">
                    {index === 0 && <FormLabel>&nbsp;</FormLabel>}
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ description: '', quantity: 1, price: 0 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField name="paymentDetails.bankName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input {...field} placeholder="e.g. Global Bank" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="paymentDetails.accountName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input {...field} placeholder="e.g. Acme Inc." /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="paymentDetails.iban" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>IBAN</FormLabel><FormControl><Input {...field} placeholder="e.g. DE89 3704 0044 0532 0130 00" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                    <CardContent>
                        <FormField name="notes" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea {...field} placeholder="Thank you for your business!" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                 <Card>
                    <CardHeader><CardTitle>Tax</CardTitle></CardHeader>
                    <CardContent>
                        <FormField name="taxRate" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>
                <Card className="bg-muted">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Tax ({watchTaxRate || 0}%)</span><span>${tax.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </Form>
  );
}
