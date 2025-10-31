'use client';

import { useInvoices } from '@/hooks/use-invoices';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { FilePlus2, Receipt, Upload, Download, Trash2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useRef } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function InvoiceDashboard() {
  const { invoices, isLoading, backupData, restoreData, deleteInvoice } = useInvoices();
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'unpaid':
        return 'destructive';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const calculateTotal = (invoice: any) => {
    const subtotal = invoice.items.reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);
    const tax = subtotal * ((invoice.taxRate || 0) / 100);
    return subtotal + tax;
  };
  
  const handleRestoreClick = () => {
    restoreInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      restoreData(file);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-20">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new invoice or restoring from a backup.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Button asChild>
            <Link href="/invoices/new">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
          <Button variant="outline" onClick={handleRestoreClick}>
            <Upload className="mr-2 h-4 w-4" />
            Restore Data
          </Button>
          <input
            type="file"
            ref={restoreInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Invoices</CardTitle>
        <div className="flex gap-2">
            <Button variant="outline" onClick={backupData}>
                <Download className="mr-2 h-4 w-4" />
                Backup Data
            </Button>
            <Button variant="outline" onClick={handleRestoreClick}>
                <Upload className="mr-2 h-4 w-4" />
                Restore Data
            </Button>
             <input
                type="file"
                ref={restoreInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
            />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.client.name}</TableCell>
                <TableCell>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status)} className="capitalize">
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(calculateTotal(invoice))}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/invoices/${invoice.id}`}>View</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="ml-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this
                          invoice and remove its data from the server.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteInvoice(invoice.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
